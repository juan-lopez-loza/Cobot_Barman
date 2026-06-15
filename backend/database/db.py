import os
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel, create_engine, Session

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

class Cocktail(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(max_length=50)

    steps: list["RecipeStep"] = Relationship(back_populates="cocktail")

class RecipeStep(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    cocktail_id: int = Field(foreign_key="cocktail.id")
    step_order: int
    description: str

    cocktail: Cocktail = Relationship(back_populates="steps")
    points: list["TrajectoryPoint"] = Relationship(back_populates="step")

class TrajectoryPoint(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    step_id: int = Field(foreign_key="recipestep.id")
    point_order: int
    x: float
    y: float
    z: float
    rx: float
    ry: float
    rz: float
    speed: int = Field(default=10)
    duration: int = Field(default=0)

    step: RecipeStep = Relationship(back_populates="points")


class GlassSlot(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    is_free: bool = Field(default=True)
    x: float
    y: float
    z: float
    rx: float
    ry: float
    rz: float

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session