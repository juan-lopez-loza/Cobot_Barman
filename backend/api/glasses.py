from fastapi import APIRouter, HTTPException, Depends
from app.utils.glasses import glasses_state
from pydantic import BaseModel
from api.admin import verif_token
from app.utils.load_json import open_data

router = APIRouter(prefix="/glasses", tags=["glasses"])

class Glasses(BaseModel):
    id: int
    state: bool

@router.get("/")
def get_glasses(username: str = Depends(verif_token)):
    database = open_data()
    return database[1]['glasses']

@router.put("/edit_glasses")
def edit_glasses(glasses_id: int, state: bool, username: str = Depends(verif_token)):
    return glasses_state(glasses_id, state)