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
        global database
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

def find_drink(command: str):
    drinks = database[0]["drinks"]
    for drink in drinks:
        if drink["name"] == command:
            return drink["positions"]


def create_script(positions: list):
    command = ""
    for element in positions:
        command += f"  {element['value']}\n"

    fullscript = init_script
    fullscript += '\n  popup("Program from pc started")\n'
    fullscript += command
    fullscript += '  popup("Program from pc ended")\n'
    fullscript += "end\n"
    return fullscript