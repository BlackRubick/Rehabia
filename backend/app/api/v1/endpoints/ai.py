from fastapi import APIRouter

from app.schemas.ai import AnalyzePoseRequest, AnalyzePoseResponse
from app.services.pose_analyzer import pose_analyzer

router = APIRouter()


@router.post('/analyze', response_model=AnalyzePoseResponse)
def analyze_pose(payload: AnalyzePoseRequest):
    result = pose_analyzer.analyze(
        image_base64=payload.image_base64,
        side=payload.side,
        range_min=payload.range_min,
        range_max=payload.range_max,
    )
    return AnalyzePoseResponse(**result)
