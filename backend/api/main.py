from fastapi import FastAPI
from dotenv import load_dotenv
from database.db import init_db
from utils.robot import connect_to_robot
from api import orders, cocktails, admin

load_dotenv()
app = FastAPI()


@app.on_event("startup")
async def startup():
    init_db()
    print("Database initialized")
    await connect_to_robot()

app.include_router(orders.router)
app.include_router(cocktails.router)
# app.include_router(admin.router)