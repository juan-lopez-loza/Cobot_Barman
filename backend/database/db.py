from typing import List, Optional
from sqlalchemy import ForeignKey, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")

engine = create_engine(db_url)

def init_db():
    Base.metadata.create_all(bind=engine)


class Base(DeclarativeBase):
    pass


class Cocktail(Base):
    __tablename__ = "cocktail"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    steps: Mapped[List["RecipeStep"]] = relationship(back_populates="cocktail", cascade="all, delete-orphan")


class RecipeStep(Base):
    __tablename__ = "recipestep"

    id: Mapped[int] = mapped_column(primary_key=True)
    cocktail_id: Mapped[int] = mapped_column(ForeignKey("cocktail.id", ondelete="CASCADE"))
    drink_id: Mapped[Optional[int]] = mapped_column(ForeignKey("drink.id"))
    step_order: Mapped[int]
    description: Mapped[str] = mapped_column(String(255))
    cocktail: Mapped["Cocktail"] = relationship(back_populates="steps")
    points: Mapped[List["TrajectoryPoint"]] = relationship(back_populates="step", cascade="all, delete-orphan")
    drink: Mapped[Optional["Drink"]] = relationship()


class TrajectoryPoint(Base):
    __tablename__ = "trajectorypoint"

    id: Mapped[int] = mapped_column(primary_key=True)
    step_id: Mapped[int] = mapped_column(ForeignKey("recipestep.id", ondelete="CASCADE"))
    point_order: Mapped[int]
    x: Mapped[float]
    y: Mapped[float]
    z: Mapped[float]
    rx: Mapped[float]
    ry: Mapped[float]
    rz: Mapped[float]

    speed: Mapped[int] = mapped_column(default=10)
    duration: Mapped[int] = mapped_column(default=0)
    step: Mapped["RecipeStep"] = relationship(back_populates="points")


class GlassSlot(Base):
    __tablename__ = "glassslot"

    id: Mapped[int] = mapped_column(primary_key=True)
    is_free: Mapped[bool] = mapped_column(default=True)
    x: Mapped[float]
    y: Mapped[float]
    z: Mapped[float]
    rx: Mapped[float]
    ry: Mapped[float]
    rz: Mapped[float]


class Drink(Base):
    __tablename__ = "drink"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    x: Mapped[float]
    y: Mapped[float]
    z: Mapped[float]
    rx: Mapped[float]
    ry: Mapped[float]
    rz: Mapped[float]


class Admin(Base):
    __tablename__ = "admin"

    id: Mapped[int] = mapped_column(primary_key=True)
    password: Mapped[str] = mapped_column(String(255))