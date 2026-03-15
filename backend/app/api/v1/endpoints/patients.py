from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_patient
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.patient import Patient
from app.models.routine import Routine
from app.models.session import Session as SessionModel
from app.models.user import User
from app.schemas.patient import PatientRegister, PatientRegisterResponse
from app.schemas.routine import RoutineOut
from app.schemas.session import SessionOut
from app.services.patient_id import generate_patient_unique_id

router = APIRouter()


@router.post('/register', response_model=PatientRegisterResponse, status_code=status.HTTP_201_CREATED)
def register_patient(payload: PatientRegister, db: Session = Depends(get_db)):
    exists_user = db.query(User).filter(User.username == payload.username).first()
    if exists_user:
        raise HTTPException(status_code=400, detail='El usuario ya existe')

    unique_id = generate_patient_unique_id()
    while db.query(Patient).filter(Patient.unique_id == unique_id).first():
        unique_id = generate_patient_unique_id()

    patient = Patient(
        unique_id=unique_id,
        nombre=payload.nombre,
        edad=payload.edad,
        lesion=payload.lesion,
        rodilla_afectada=payload.rodilla_afectada,
        actividad_profesion=payload.actividad_profesion,
    )
    db.add(patient)
    db.flush()

    user = User(
        username=payload.username,
        password_hash=get_password_hash(payload.password),
        role='patient',
        patient_id=patient.id,
    )
    db.add(user)
    db.commit()

    return PatientRegisterResponse(patient_unique_id=unique_id, username=payload.username)


@router.get('/me/routines', response_model=list[RoutineOut])
def get_my_routines(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    routines = (
        db.query(Routine)
        .filter(Routine.paciente_id == current_user.patient_id)
        .order_by(Routine.fecha_asignacion.desc())
        .all()
    )
    return routines


@router.get('/me/sessions', response_model=list[SessionOut])
def get_my_sessions(current_user: User = Depends(require_patient), db: Session = Depends(get_db)):
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.paciente_id == current_user.patient_id)
        .order_by(SessionModel.fecha.desc())
        .all()
    )
    return sessions
