import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

host = os.getenv("ROBOT_HOST")
port = os.getenv("ROBOT_PORT")


async def handle_client(reader, writer):
    while True:
        data = await reader.readline()
        if not data: break
        command = data.decode().strip()
        if command == "PING": response = "PONG"
        else: response = "ERROR"
        writer.write(f"{response}\n".encode())
        await writer.drain()

async def init_server():
    server =  await asyncio.start_server(handle_client, host=host, port=port)
    print(f"Robot Server started at {host}:{port}")
    asyncio.create_task(server.serve_forever())