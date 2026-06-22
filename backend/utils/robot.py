import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("ROBOT_HOST")
port = os.getenv("ROBOT_PORT")

robot_reader: asyncio.StreamReader = None
robot_writer: asyncio.StreamWriter = None

async def connect_to_robot():
    print(f"Connecting to Robot at {host}:{port}")
    global robot_reader, robot_writer
    try:
        robot_reader, robot_writer = await asyncio.open_connection(host, port)
        print("Connected to Robot successfully")
    except Exception as e:
        print(f"Failed to connect to Robot: {e}")


async def send_robot_command(command: str):
    if robot_writer:
        robot_writer.write(f"{command}\n".encode())
        await robot_writer.drain()
        return "Commande envoyée"
    return "Robot non connecté"

async def get_robot_response():
    if robot_reader:
        data = await robot_reader.readline()
        print(f"Robot response: {data}")
