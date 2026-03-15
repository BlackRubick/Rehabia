from pydantic import BaseModel


class AnalyzePoseRequest(BaseModel):
    image_base64: str
    side: str = 'izquierda'
    range_min: float = 80
    range_max: float = 130


class AnalyzePoseResponse(BaseModel):
    detected: bool
    status: str
    angle: float
