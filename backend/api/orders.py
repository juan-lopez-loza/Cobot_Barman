import asyncio
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.utils.robot import find_drink, create_script, send_to_robot, rg_command
from app.utils.glasses import find_glasses, change_glass_state
from api.cocktails import get_db
from database.db import engine, Cocktail, RecipeStep, TrajectoryPoint, Drink, GlassSlot
from sqlmodel import Session, select

router = APIRouter(prefix="/orders", tags=["orders"])

class RobotCommand(BaseModel):
    command: str

@router.post("/")
async def send_order(drink_id: int):
    glass = find_glasses()
    change_glass_state(glass)
    rg_positions = rg_command()
    drink_positions = find_drink(drink_id)
    script = create_script(drink_positions, glass, rg_positions)
    send_to_robot(script)
    return {"Status": "ok"}