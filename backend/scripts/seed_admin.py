from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User


def run() -> None:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.username == 'admin').first()
        if user:
            user.password_hash = get_password_hash('123123123')
            user.role = 'admin'
            db.commit()
            print('Admin actualizado -> usuario: admin | contraseña: 123123123')
            return

        admin = User(username='admin', password_hash=get_password_hash('123123123'), role='admin')
        db.add(admin)
        db.commit()
        print('Admin creado -> usuario: admin | contraseña: 123123123')
    finally:
        db.close()


if __name__ == '__main__':
    run()
