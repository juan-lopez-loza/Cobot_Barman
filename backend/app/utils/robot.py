import os
import json
import threading
from dotenv import load_dotenv
from fastapi import HTTPException
import socket
from queue import Queue
from app.rpc.ur import ur_methods

load_dotenv()

host = os.getenv("ROBOT_HOST")
port = os.getenv("ROBOT_PORT")
backend_host = os.getenv("BACKEND_HOST")
backend_rpc_port = int(os.getenv("BACKEND_RPC_PORT"))

class RobotState:
    unknown = 0
    ready = 1
    receiving_program = 2
    program_started = 3
    program_ended = 4
    error = 5

with open("./app/robot_src/init_onrobot.script", "r") as f:
    init_script = f.read()

def open_data():
    with open('./database/test.json', 'r') as f:
        json_data = f.read()
        database = json.loads(json_data)
        return database

def connect_to_robot():
    try:
        global s
        s = socket.create_connection((host, port))
        print("Connected to Robot")
    except Exception as e:
        print(f"Failed to connect to Robot: {e}")

def send_to_robot(script: str):
    try:
        s.sendall(script.encode("UTF8"))
        print("Command sent successfully")
    except Exception as e:
        print(f"Failed to send command: {e}")

def find_drink(command: int) -> dict:
    database = open_data()
    drinks = database[0]["drinks"]
    for drink in drinks:
        if drink["id"] == command:
            return drink
    raise HTTPException(status_code=404, detail="Drink not found")

def find_drink_by_name(name: str) -> dict:
    database = open_data()
    drinks = database[0]["drinks"]
    for drink in drinks:
        if drink["name"].lower() == name.lower():
            return drink
    raise HTTPException(status_code=404, detail=f"Drink '{name}' not found")

def rg_command() -> list:
    database = open_data()
    positions = database[2]["RG"]
    for position in positions:
        return position['position']
    raise HTTPException(status_code=404, detail="RG positions not found")

def get_time_value(database: list, label: str) -> str:
    times = database[3]["time"]
    for t in times:
        if t["label"] == label:
            return t["value"]
    raise HTTPException(status_code=404, detail=f"Time '{label}' not found")

def build_water_segment(database: list, time_label: str) -> str:
    """
    Construit le segment 'eau' en respectant l'ordre déclaré dans le JSON
    (GoWater1 -> GoWater2 -> triggerWater(True) -> [attente] -> triggerWater(False) -> GoBack1 -> GoBack2).
    Le temps d'attente (TimeWater ou TimeOnlyWater) est inséré juste après le déclenchement True.
    """
    water_drink = find_drink_by_name("water")
    positions = water_drink["positions"]
    time_value = get_time_value(database, time_label)

    segment = ""
    for p in positions:
        segment += f"  {p['value']}\n"
        if p["label"] == "triggerWater" and "True" in p["value"]:
            segment += f"  {time_value}\n"

    return segment


def build_drink_segment(database: list, drink: dict) -> str:
    """
    Construit le segment de script propre à la boisson commandée :
    - sirop : DS -> US -> TimeSyrup -> DS, puis eau optionnelle si drink['water'] est True
    - eau seule (drink 'water') : GoWater1 -> GoWater2 -> trigger(True) -> TimeOnlyWater -> trigger(False) -> GoBack1 -> GoBack2
    """
    positions = drink["positions"]
    labels = {p["label"] for p in positions}

    segment = ""

    if "DS" in labels and "US" in labels:
        drink_ds = next(p["value"] for p in positions if p["label"] == "DS")
        drink_us = next(p["value"] for p in positions if p["label"] == "US")
        time_syrup = get_time_value(database, "TimeSyrup")

        segment += f"  {drink_ds}\n"
        segment += f"  {drink_us}\n"
        segment += f"  {time_syrup}\n"
        segment += f"  {drink_ds}\n"

        if drink.get("water"):
            segment += build_water_segment(database, "TimeWater")
    elif "triggerWater" in labels:
        segment += build_water_segment(database, "TimeOnlyWater")
    else:
        raise HTTPException(status_code=400, detail="Unknown drink position layout")

    return segment

def create_script(drink: dict, glass: dict, rg_positions: list) -> str:
    database = open_data()

    rg_close = next(p["value"] for p in rg_positions if p["label"] == "close")
    rg_open = next(p["value"] for p in rg_positions if p["label"] == "open")

    glass_value = glass["value"]
    glass_aproach = glass["aproach"]

    drink_segment = build_drink_segment(database, drink)

    script_step = database[4]["script"][0]["positions"]

    command = ""
    for element in script_step:
        if element["label"] == "front_to_glass":
            command += f"  {element['value']}\n"
            command += f"  {glass_value}\n"
            command += f"  {rg_close}\n"
            command += f"  {glass_aproach}\n"

        elif element["label"] == "home":
            command += f"  {element['value']}\n"
            command += drink_segment

        elif element["label"] == "DropGlass":
            command += f"  {element['value']}\n"
            command += f"  {rg_open}\n"

        else:
            command += f"  {element['value']}\n"

    fullscript = init_script
    fullscript += f'\n  barman_rpc = rpc_factory("xmlrpc", "http://{backend_host}:{backend_rpc_port}")\n'
    fullscript += '  barman_rpc.set_status_program_started()\n'
    fullscript += '  popup("Program from pc started")\n'
    fullscript += command
    fullscript += '  barman_rpc.set_status_program_finished()\n'
    fullscript += '  popup("Program from pc ended")\n'
    fullscript += "end\n"
    return fullscript


# ---- Gestion de la queue de commandes ----

command_queue: Queue = Queue()
_dispatch_lock = threading.Lock()


def dispatch_next_command():
    """Envoie la prochaine commande au robot si celui-ci est disponible.
    Protégé par un verrou pour éviter les race conditions lors d'appels concurrents.
    """
    with _dispatch_lock:
        if ur_methods.is_busy():
            print(f"[Queue] Robot occupé, commande mise en attente. Taille queue: {command_queue.qsize()}")
            return
        if not command_queue.empty():
            command = command_queue.get()
            print(f"[Queue] Envoi commande id={command['id']} au robot")
            ur_methods.set_current_command(command["id"])
            ur_methods.set_status_program_started()
            send_to_robot(command["script"])
        else:
            print("[Queue] Aucune commande en attente.")


def on_program_finished():
    print("[Queue] Programme terminé, vérification de la queue...")
    dispatch_next_command()


ur_methods.register_on_finished(on_program_finished)