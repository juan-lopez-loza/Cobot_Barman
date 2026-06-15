from fastapi import APIRouter
from pydantic import BaseModel
from utils.robot import send_robot_command

router = APIRouter(prefix="/orders", tags=["orders"])

class RobotCommand(BaseModel):
    command: str

@router.post("/robot")
async def send_command(payload: RobotCommand):
    value = payload.command
    res = await send_robot_command(value)
    return {"status": "success", "robot_response": res}
