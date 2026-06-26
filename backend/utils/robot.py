import os
import json
from dotenv import load_dotenv
import socket
from email.header import UTF8

load_dotenv()

host = os.getenv("ROBOT_HOST")
port = os.getenv("ROBOT_PORT")

with open("./robot_src/init_onrobot.script", "r") as f:
    init_script = f.read()

def open_data():
    with open('./database/test.json', 'r') as f:
        json_data = f.read()
        database = json.loads(json_data)
        return database

with open("./robot_src/init_onrobot.script", "r") as f:
    init_script = f.read()

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

def find_glasses():
    database = open_data()
    glasses = database[1]["glasses"]
    for glass in glasses:
        if glass['state']:
            return glass

def find_drink(command: int):
    database = open_data()
    drinks = database[0]["drinks"]
    for drink in drinks:
        if drink["id"] == command:
            return drink["positions"]

def rg_command():
    database = open_data()
    positions = database[2]["RG"]
    for position in positions:
        return position['position']

#def change_glass_state(glass: list):
    #glass_state = glass['state']
    #glass_state = False
    #with open("./database/test.json", "w") as f:
        #f.write(glass_state)

def create_script(drink_positions: list, glass: list, rg_positions: list):
    database = open_data()
    rg_close = next(p['value'] for p in rg_positions if p['label'] == 'close')
    rg_open = next(p['value'] for p in rg_positions if p['label'] == 'open')

    glass_value = glass['value']
    glass_aproach = glass['aproach']

    drink_ds = next(p['value'] for p in drink_positions if p['label'] == 'DS')
    drink_us = next(p['value'] for p in drink_positions if p['label'] == 'US')

    script_step = database[3]["script"][0]['positions']

    command = ""
    for element in script_step:
        if element['label'] == 'front_to_glass':
            command += f"  {element['value']}\n"
            command += f"  {glass_value}\n"
            command += f"  {rg_close}\n"
            command += f"  {glass_aproach}\n"

        elif element['label'] == 'home':
            command += f" {element['value']}\n"
            command += f"  {drink_ds}\n"
            command += f"  {drink_us}\n"

        elif element['label'] ==  'TimeSyrup':
            command += f" {element['value']}\n"
            command += f"  {drink_ds}\n"
        elif element['label'] == 'DropGlass':command += f"  {rg_open}\n"
        else: command += f"  {element['value']}\n"

    fullscript = init_script
    fullscript += '\n  popup("Program from pc started")\n'
    fullscript += command
    fullscript += '  popup("Program from pc ended")\n'
    fullscript += "end\n"
    return fullscript