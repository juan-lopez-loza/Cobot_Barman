from fastapi import FastAPI
import asyncio
from dotenv import load_dotenv
from database.db import init_db
from utils.robot import connect_to_robot
from api import orders, cocktails, admin
from robot_src.simu_efort import init_server

load_dotenv()
app = FastAPI()
app.include_router(orders.router)
app.include_router(cocktails.router)
#app.include_router(admin.router)

@app.on_event("startup")
async def startup():
    init_db()
    print("Database initialized")
    await init_server()
    await connect_to_robot()