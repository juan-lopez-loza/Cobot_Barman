from fastapi import FastAPI
from dotenv import load_dotenv
from database.db import init_db
from app.utils.robot import connect_to_robot
from app.utils.load_json import open_data
from api import orders, cocktails, admin, glasses
from app.rpc.xmlrpc_server import start_xmlrpc_server
load_dotenv()
app = FastAPI()
app.include_router(orders.router)
app.include_router(cocktails.router)
app.include_router(admin.router)
app.include_router(glasses.router)

@app.on_event("startup")
async def startup():
    start_xmlrpc_server()
    init_db()
    open_data()
    connect_to_robot()
    print("Database initialized")