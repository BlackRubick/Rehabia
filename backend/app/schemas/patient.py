from datetime import datetime

from pydantic import BaseModel, Field


class PatientRegister(BaseModel):
    nombre: str
    edad: int = Field(ge=1, le=120)
    lesion: str
    rodilla_afectada: str
    actividad_profesion: str
    username: str
    password: str


class PatientOut(BaseModel):
    id: int
    unique_id: str
    nombre: str
    edad: int
    lesion: str
    rodilla_afectada: str
    actividad_profesion: str
    rango_min: int
    rango_max: int
    fecha_registro: datetime

    model_config = {'from_attributes': True}


class PatientRegisterResponse(BaseModel):
    patient_unique_id: str
    username: str
