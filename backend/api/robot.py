from fastapi import APIRouter
from app.rpc.ur import ur_methods

router = APIRouter(prefix="/robot", tags=["Robot"])

@router.get("/status")
async def get_robot_status():
    return ur_methods.get_status()