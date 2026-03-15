from datetime import datetime

from pydantic import BaseModel, Field


class RoutineCreate(BaseModel):
    nombre_ejercicio: str
    repeticiones_objetivo: int = Field(ge=1, le=1000)
    rango_min: int = Field(ge=0, le=180)
    rango_max: int = Field(ge=0, le=180)
    duracion_minutos: int = Field(ge=1, le=180)
    video_demo_url: str = ''


class RoutineOut(BaseModel):
    id: int
    paciente_id: int
    nombre_ejercicio: str
    repeticiones_objetivo: int
    angulo_objetivo: int
    rango_min: int
    rango_max: int
    duracion_minutos: int
    video_demo_url: str
    fecha_asignacion: datetime

    model_config = {'from_attributes': True}
