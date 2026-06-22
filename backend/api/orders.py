import asyncio
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.robot import send_robot_command, get_robot_response
from api.cocktails import get_db
from database.db import engine, Cocktail, RecipeStep, TrajectoryPoint, Drink, GlassSlot
from sqlmodel import Session, select
import json

router = APIRouter(prefix="/orders", tags=["orders"])

class RobotCommand(BaseModel):
    command: str

with open('./database/test.json', 'r') as f:
    json_data = f.read()
    data = json.loads(json_data)


@router.post("/robot")
async def send_command(payload: RobotCommand):
    value = payload.command
    res = await send_robot_command(value)
    return {"status": "success", "robot_response": res}

@router.post("/{cocktail_id}")
async def send_order(cocktail_id: int, db: Session = Depends(get_db)):
    statement = select(Cocktail.name).where(Cocktail.id == cocktail_id)
    results = db.exec(statement)
    print(f"Vous avez commandé le cocktail: {results.all()}")

    for element in data:
        await send_robot_command(element["value"])
        print(f"Command send to robot: {element['label']}")
        await asyncio.sleep(5)