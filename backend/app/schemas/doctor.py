from pydantic import BaseModel, Field


class DoctorCreate(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=6, max_length=128)


class DoctorOut(BaseModel):
    id: int
    username: str
    role: str

    model_config = {'from_attributes': True}


class DoctorUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=80)
    password: str | None = Field(default=None, min_length=6, max_length=128)
