from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Session(Base):
    __tablename__ = 'sesiones'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paciente_id: Mapped[int] = mapped_column(ForeignKey('pacientes.id', ondelete='CASCADE'))
    rutina_id: Mapped[int] = mapped_column(ForeignKey('rutinas.id', ondelete='SET NULL'), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    repeticiones_validas: Mapped[int] = mapped_column(Integer, default=0)
    repeticiones_invalidas: Mapped[int] = mapped_column(Integer, default=0)
    angulo_promedio: Mapped[float] = mapped_column(Float, default=0)
    cumplio_objetivo: Mapped[bool] = mapped_column(Boolean, default=False)

    patient = relationship('Patient', back_populates='sessions')
