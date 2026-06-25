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
    with open("./database/Fullscript.script", "w") as f:
        f.write(script)
    try:
        s.sendall(script.encode("UTF8"))
        print("Command sent successfully")
    except Exception as e:
        print(f"Failed to send command: {e}")

def find_glasses():
    database = open_data()
    glasses = database[1]["glasses"]
    glass_positions = ""
    for glass in glasses:
        if glass['state']:
            glass_positions += glass['value'] + "\n"
            glass_positions += glass['aproach'] + "\n"
            return glass_positions

def find_drink(command: str):
    database = open_data()
    drinks = database[0]["drinks"]
    for drink in drinks:
        if drink["name"] == command:
            return drink["positions"]

def rg_command():
    database = open_data()
    positions = database[2]["RG"]
    for position in positions:
        return position['position']

def create_script(positions: list, glass: str, rg_positions: list):
    rg_close = next(p['value'] for p in rg_positions if p['label'] == 'close')
    rg_open = next(p['value'] for p in rg_positions if p['label'] == 'open')

    glass_value = glass['value']
    glass_aproach = glass['aproach']

    command = ""
    for element in positions:
        if element['label'] == 'front_to_glass':
            command += f"  {element['value']}\n"
            command += f"  {glass_value}\n"
            command += f"  {rg_close}\n"
            command += f"  {glass_aproach}\n"
        elif element['label'] == 'DropGlass':
            command += f"  {rg_open}\n"
        else: command += f"  {glass_aproach}\n"

    fullscript = init_script
    fullscript += '\n  popup("Program from pc started")\n'
    fullscript += command
    fullscript += '  popup("Program from pc ended")\n'
    fullscript += "end\n"
    return fullscript