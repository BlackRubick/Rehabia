from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Routine(Base):
    __tablename__ = 'rutinas'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paciente_id: Mapped[int] = mapped_column(ForeignKey('pacientes.id', ondelete='CASCADE'))
    nombre_ejercicio: Mapped[str] = mapped_column(String(150), nullable=False)
    repeticiones_objetivo: Mapped[int] = mapped_column(Integer, nullable=False)
    angulo_objetivo: Mapped[int] = mapped_column(Integer, default=110)
    rango_min: Mapped[int] = mapped_column(Integer, default=80)
    rango_max: Mapped[int] = mapped_column(Integer, default=130)
    duracion_minutos: Mapped[int] = mapped_column(Integer, default=15)
    video_demo_url: Mapped[str] = mapped_column(String(255), default='')
    fecha_asignacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient = relationship('Patient', back_populates='routines')
