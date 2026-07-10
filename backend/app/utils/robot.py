import os
import json
import threading
import time
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

def _get_pos(positions: list, label: str) -> str:
    for p in positions:
        if p["label"] == label:
            return p["value"]
    raise HTTPException(status_code=500, detail=f"Position '{label}' introuvable dans le JSON")


def _get_time(database: list, label: str) -> str:
    for t in database[3]["time"]:
        if t["label"] == label:
            return t["value"]
    raise HTTPException(status_code=500, detail=f"Temps '{label}' introuvable dans le JSON")


def build_syrup_segment(drink: dict, time_syrup: str) -> str:
    positions = drink["positions"]
    labels = {p["label"] for p in positions}

    ds = _get_pos(positions, "DS")
    us = _get_pos(positions, "US")

    segment = ""

    if "GoToSyrup1" in labels and "GotoSyrup2" in labels:
        goto1 = _get_pos(positions, "GoToSyrup1")
        goto2 = _get_pos(positions, "GotoSyrup2")

        segment += f"  {goto1}\n"
        segment += f"  {goto2}\n"
        segment += f"  {ds}\n"
        segment += f"  {us}\n"
        segment += f"  {time_syrup}\n"
        segment += f"  {ds}\n"
        segment += f"  {goto2}\n"
        segment += f"  {goto1}\n"
    elif "GoToSyrup" in labels:
        goto = _get_pos(positions, "GoToSyrup")

        segment += f"  {goto}\n"
        segment += f"  {ds}\n"
        segment += f"  {us}\n"
        segment += f"  {time_syrup}\n"
        segment += f"  {ds}\n"
        segment += f"  {goto}\n"
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Drink '{drink['name']}' (id={drink['id']}) n'a ni GoToSyrup1 ni GoToSyrup dans ses positions"
        )
    return segment

def build_water_segment(database: list, time_label: str) -> str:
    water_drink = find_drink_by_name("water")
    positions = water_drink["positions"]
    time_value = _get_time(database, time_label)

    trigger_true  = next(p["value"] for p in positions if p["label"] == "triggerWater" and "True"  in p["value"])
    trigger_false = next(p["value"] for p in positions if p["label"] == "triggerWater" and "False" in p["value"])

    segment = ""
    segment += f"  {_get_pos(positions, 'ToWater1')}\n"
    segment += f"  {_get_pos(positions, 'ToWater2')}\n"
    segment += f"  {_get_pos(positions, 'DSWater')}\n"
    segment += f"  {trigger_true}\n"
    segment += f"  {time_value}\n"
    segment += f"  {trigger_false}\n"
    segment += f"  {_get_pos(positions, 'wait')}\n"
    segment += f"  {_get_pos(positions, 'BackWater1')}\n"
    segment += f"  {_get_pos(positions, 'BackWater2')}\n"

    return segment

def create_script(drink: dict, glass: dict, rg_positions: list) -> str:
    database = open_data()

    global_positions = database[5]["positions"]
    home          = _get_pos(global_positions, "home")
    front_glass   = _get_pos(global_positions, "front_to_glass")
    go_back       = _get_pos(global_positions, "GoBack")

    rg_close = next(p["value"] for p in rg_positions if p["label"] == "close")
    rg_open  = next(p["value"] for p in rg_positions if p["label"] == "open")

    glass_front   = glass["FrontGlass"]
    glass_value   = glass["value"]
    glass_up = glass["UpGlass"]

    drops     = database[4]["bar-drops"][0]
    drop1_pos = drops["drop1"]
    drop1     = _get_pos(drop1_pos, "Drop1")
    backdrop1 = _get_pos(drop1_pos, "BackDrop1")

    time_syrup = _get_time(database, "TimeSyrup")

    is_water_only = drink["name"].lower() == "water"

    command = ""

    command += f"  {rg_open}\n"
    command += f"  {home}\n"
    command += f"  {front_glass}\n"
    command += f"  {glass_front}\n"
    command += f"  {glass_value}\n"
    command += f"  {rg_close}\n"
    command += f"  {glass_up}\n"
    command += f"  {glass_front}\n"
    command += f"  {go_back}\n"
    command += f"  {home}\n"

    if not is_water_only:
        command += build_syrup_segment(drink, time_syrup)
        command += f"  {home}\n"

    if is_water_only:
        command += build_water_segment(database, "TimeOnlyWater")
    elif drink.get("water"):
        command += build_water_segment(database, "TimeWater")
    command += f"  {home}\n"

    command += f"  {drop1}\n"
    command += f"  {rg_open}\n"
    command += f"  {backdrop1}\n"
    command += f"  {home}\n"

    fullscript  = init_script
    fullscript += f'\n  barman_rpc = rpc_factory("xmlrpc", "http://{backend_host}:{backend_rpc_port}")\n'
    fullscript += '  barman_rpc.set_status_program_started()\n'
    fullscript += command
    fullscript += '  barman_rpc.set_status_program_finished()\n'
    fullscript += "end\n"

    print(f"[Script] Généré pour drink='{drink['name']}' (id={drink['id']}), verre='{glass.get('label', '?')}'")
    return fullscript


command_queue: Queue = Queue()
_dispatch_lock = threading.Lock()


def dispatch_next_command():
    with _dispatch_lock:
        if ur_methods.is_busy():
            print(f"[Queue] Robot occupé, commande mise en attente. Taille queue: {command_queue.qsize()}")
            return
        if not command_queue.empty():
            command = command_queue.get()
            print(f"[Queue] Envoi commande id={command['id']} au robot")
            ur_methods.set_current_command(command["id"])
            ur_methods.set_status_running_preemptive()
            send_to_robot(command["script"])
        else:
            print("[Queue] Aucune commande en attente.")


def on_program_finished():
    print("[Queue] Programme terminé. Pause de sécurité de 2 secondes avant la suite...")
    time.sleep(2.0)
    print("[Queue] Vérification de la queue...")
    dispatch_next_command()


ur_methods.register_on_finished(on_program_finished)