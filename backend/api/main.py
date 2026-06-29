from fastapi import FastAPI
from dotenv import load_dotenv
from database.db import init_db
from utils.robot import connect_to_robot
from utils.load_json import open_data
from api import orders, cocktails, admin
load_dotenv()
app = FastAPI()
app.include_router(orders.router)
app.include_router(cocktails.router)
app.include_router(admin.router)

@app.on_event("startup")
async def startup():
    init_db()
    open_data()
    connect_to_robot()
    print("Database initialized")