from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from database.db import engine, Cocktail, Admin

router = APIRouter(prefix="/cocktails", tags=["cocktails"])

class CocktailModel(BaseModel):
    name: str

def get_db():
    with Session(engine) as session:
        yield session

@router.get("/", tags=["cocktails"])
async def get_cocktail(db: Session = Depends(get_db)):
    statement = select(Cocktail)
    results = db.exec(statement)
    cocktails = results.all()
    return cocktails

@router.post("/new_cocktail", tags=["cocktails"])
async def add_cocktail(payload: CocktailModel, db: Session = Depends(get_db)):
    new_cocktail = Cocktail(name=payload.name)
    db.add(new_cocktail)
    db.commit()
    db.refresh(new_cocktail)
    return await get_cocktail(db=db)