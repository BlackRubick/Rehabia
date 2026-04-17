from fastapi import Path

# Eliminar rutina asignada a un paciente
@router.delete('/patients/{patient_unique_id}/routines/{routine_id}', status_code=204)
def delete_patient_routine(
    patient_unique_id: str,
    routine_id: int = Path(..., description="ID de la rutina a eliminar"),
    _: object = Depends(require_staff),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.unique_id == patient_unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente no encontrado')
    routine = db.query(Routine).filter(Routine.id == routine_id, Routine.paciente_id == patient.id).first()
    if not routine:
        raise HTTPException(status_code=404, detail='Rutina no encontrada para este paciente')
    db.delete(routine)
    db.commit()
    return None
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_admin, require_staff
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.patient import Patient
from app.models.routine import Routine
from app.models.session import Session as SessionModel
from app.models.user import User
from app.schemas.doctor import DoctorCreate, DoctorOut, DoctorUpdate
from app.schemas.patient import PatientOut
from app.schemas.routine import RoutineCreate, RoutineOut

router = APIRouter()


@router.get('/patients', response_model=list[PatientOut])
def list_patients(
    _: object = Depends(require_staff),
    db: Session = Depends(get_db),
):
    patients = db.query(Patient).order_by(Patient.fecha_registro.desc()).all()
    return patients


@router.get('/patients/{patient_unique_id}', response_model=PatientOut)
def get_patient_by_unique_id(
    patient_unique_id: str,
    _: object = Depends(require_staff),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.unique_id == patient_unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente no encontrado')
    return patient


@router.post('/patients/{patient_unique_id}/routines', response_model=RoutineOut)
def create_or_update_routine(
    patient_unique_id: str,
    payload: RoutineCreate,
    _: object = Depends(require_staff),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.unique_id == patient_unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente no encontrado')

    routine = Routine(
        paciente_id=patient.id,
        nombre_ejercicio=payload.nombre_ejercicio,
        repeticiones_objetivo=payload.repeticiones_objetivo,
        rango_min=payload.rango_min,
        rango_max=payload.rango_max,
        angulo_objetivo=(payload.rango_min + payload.rango_max) // 2,
        duracion_minutos=payload.duracion_minutos,
        video_demo_url=payload.video_demo_url,
    )
    db.add(routine)

    patient.rango_min = payload.rango_min
    patient.rango_max = payload.rango_max

    db.commit()
    db.refresh(routine)
    return routine


@router.get('/patients/{patient_unique_id}/routines', response_model=list[RoutineOut])
def get_patient_routines(
    patient_unique_id: str,
    _: object = Depends(require_staff),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.unique_id == patient_unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente no encontrado')

    routines = (
        db.query(Routine)
        .filter(Routine.paciente_id == patient.id)
        .order_by(Routine.fecha_asignacion.desc())
        .all()
    )
    return routines


@router.get('/patients/{patient_unique_id}/stats')
def get_patient_stats(
    patient_unique_id: str,
    _: object = Depends(require_staff),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.unique_id == patient_unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente no encontrado')

    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.paciente_id == patient.id)
        .order_by(SessionModel.fecha.asc())
        .all()
    )

    return sessions


@router.post('/doctors', response_model=DoctorOut)
def create_doctor(
    payload: DoctorCreate,
    _: object = Depends(require_admin),
    db: Session = Depends(get_db),
):
    exists = db.query(User).filter(User.username == payload.username).first()
    if exists:
        raise HTTPException(status_code=400, detail='El usuario ya existe')

    doctor = User(
        username=payload.username,
        password_hash=get_password_hash(payload.password),
        role='doctor',
        patient_id=None,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.get('/doctors', response_model=list[DoctorOut])
def list_doctors(
    _: object = Depends(require_admin),
    db: Session = Depends(get_db),
):
    doctors = (
        db.query(User)
        .filter(User.role == 'doctor')
        .order_by(User.id.desc())
        .all()
    )
    return doctors


@router.put('/doctors/{doctor_id}', response_model=DoctorOut)
def update_doctor(
    doctor_id: int,
    payload: DoctorUpdate,
    _: object = Depends(require_admin),
    db: Session = Depends(get_db),
):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == 'doctor').first()
    if not doctor:
        raise HTTPException(status_code=404, detail='Doctor no encontrado')

    if payload.username is None and payload.password is None:
        raise HTTPException(status_code=400, detail='No hay cambios para aplicar')

    if payload.username is not None:
        existing = (
            db.query(User)
            .filter(User.username == payload.username, User.id != doctor_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail='El usuario ya existe')
        doctor.username = payload.username

    if payload.password is not None:
        doctor.password_hash = get_password_hash(payload.password)

    db.commit()
    db.refresh(doctor)
    return doctor


@router.delete('/doctors/{doctor_id}')
def delete_doctor(
    doctor_id: int,
    _: object = Depends(require_admin),
    db: Session = Depends(get_db),
):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == 'doctor').first()
    if not doctor:
        raise HTTPException(status_code=404, detail='Doctor no encontrado')

    db.delete(doctor)
    db.commit()
    return {'ok': True, 'detail': 'Doctor eliminado correctamente'}
