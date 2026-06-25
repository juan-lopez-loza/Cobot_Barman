import asyncio
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.robot import find_drink, create_script, send_to_robot, find_glasses, rg_command
from api.cocktails import get_db
from database.db import engine, Cocktail, RecipeStep, TrajectoryPoint, Drink, GlassSlot
from sqlmodel import Session, select

router = APIRouter(prefix="/orders", tags=["orders"])

class RobotCommand(BaseModel):
    command: str

@router.post("/")
async def send_order(drink_name: str):
    glass = find_glasses()
    rg_positions = rg_command()
    positions = find_drink(drink_name)
    script = create_script(positions, glass, rg_positions)
    send_to_robot(script)