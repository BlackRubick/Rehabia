from datetime import datetime

from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    rutina_id: int | None = None
    repeticiones_validas: int = Field(ge=0)
    repeticiones_invalidas: int = Field(ge=0)
    angulo_promedio: float = Field(ge=0, le=180)
    cumplio_objetivo: bool


class SessionOut(BaseModel):
    id: int
    rutina_id: int | None = None
    fecha: datetime
    repeticiones_validas: int
    repeticiones_invalidas: int
    angulo_promedio: float
    cumplio_objetivo: bool

    model_config = {'from_attributes': True}
