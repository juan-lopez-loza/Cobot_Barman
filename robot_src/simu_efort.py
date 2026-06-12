import asyncio

async def handle_client(reader, writer):
    while True:
        data = await reader.readline()
        if not data: break
        command = data.decode().strip()
        if command == "PING": response = "PONG"
        else: response = "ERROR"
        writer.write(f"{response}\n".encode())
        await writer.drain()

async def main():
    server =  await asyncio.start_server(handle_client, host="127.0.0.1", port=8080)
    async with server: await server.serve_forever()

asyncio.run(main())