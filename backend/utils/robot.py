import asyncio
import os
from dotenv import load_dotenv

load_dotenv()


robot_reader: asyncio.StreamReader = None
robot_writer: asyncio.StreamWriter = None

async def connect_to_robot():
    global robot_reader, robot_writer
    try:
        robot_reader, robot_writer = await asyncio.open_connection(os.getenv("ROBOT_HOST"), os.getenv("ROBOT_PORT"))
        print("Connected to Robot successfully")
    except Exception as e:
        print(f"Failed to connect to Robot: {e}")

async def send_robot_command(command: str):
    if robot_writer:
        robot_writer.write(f"{command}\n".encode())
        await robot_writer.drain()
        response = await robot_reader.readline()
        return response.decode()
    return "Robot non connecté"
