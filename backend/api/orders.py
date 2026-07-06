import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.robot import (
    find_drink,
    create_script,
    rg_command,
    command_queue,
    dispatch_next_command,
)
from app.utils.glasses import find_glasses, change_glass_state
from app.rpc.ur import ur_methods

router = APIRouter(prefix="/orders", tags=["orders"])

class RobotCommand(BaseModel):
    command: str

@router.post("/")
async def send_order(drink_id: int):
    glass = find_glasses()
    change_glass_state(glass)
    rg_positions = rg_command()
    drink = find_drink(drink_id)
    script = create_script(drink, glass, rg_positions)
    order = {"id": drink_id, "script": script}
    command_queue.put(order)
    dispatch_next_command()
    return {
        "status": "queued",
        "robot_busy": ur_methods.is_busy(),
        "queue_size": command_queue.qsize(),
    }