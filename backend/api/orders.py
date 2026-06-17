from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.robot import send_robot_command
from api.cocktails import get_db
from database.db import engine
from sqlmodel import Session, select

router = APIRouter(prefix="/orders", tags=["orders"])

class RobotCommand(BaseModel):
    command: str

@router.post("/robot")
async def send_command(payload: RobotCommand):
    value = payload.command
    res = await send_robot_command(value)
    return {"status": "success", "robot_response": res}

#@router.post("/order/{cocktail_id}")
#async def send_order(cocktail_id: int, db: Session = Depends(get_db)):
#    for x in recipestep:
#        if cocktail_id = x.
