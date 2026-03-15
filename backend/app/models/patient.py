from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Patient(Base):
    __tablename__ = 'pacientes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    unique_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    edad: Mapped[int] = mapped_column(Integer, nullable=False)
    lesion: Mapped[str] = mapped_column(String(255), nullable=False)
    rodilla_afectada: Mapped[str] = mapped_column(String(20), nullable=False)
    actividad_profesion: Mapped[str] = mapped_column(String(120), nullable=False)
    rango_min: Mapped[int] = mapped_column(Integer, default=80)
    rango_max: Mapped[int] = mapped_column(Integer, default=130)
    fecha_registro: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    routines = relationship('Routine', back_populates='patient', cascade='all, delete-orphan')
    sessions = relationship('Session', back_populates='patient', cascade='all, delete-orphan')
    user = relationship('User', back_populates='patient', uselist=False)
