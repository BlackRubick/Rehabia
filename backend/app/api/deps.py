import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('sub')
        if not username:
            raise ValueError('invalid token')
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token inválido') from exc

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Usuario no encontrado')

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Permisos insuficientes')
    return user


def require_staff(user: User = Depends(get_current_user)) -> User:
    if user.role not in {'admin', 'doctor'}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Permisos insuficientes')
    return user


def require_patient(user: User = Depends(get_current_user)) -> User:
    if user.role != 'patient':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Permisos insuficientes')
    return user
