from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import require_patient
from app.db.session import get_db
from app.models.session import Session as SessionModel
from app.models.user import User
from app.schemas.session import SessionCreate, SessionOut

router = APIRouter()


@router.post('', response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    session = SessionModel(
        paciente_id=current_user.patient_id,
        rutina_id=payload.rutina_id,
        repeticiones_validas=payload.repeticiones_validas,
        repeticiones_invalidas=payload.repeticiones_invalidas,
        angulo_promedio=payload.angulo_promedio,
        cumplio_objetivo=payload.cumplio_objetivo,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
