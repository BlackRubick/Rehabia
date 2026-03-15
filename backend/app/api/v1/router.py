from fastapi import APIRouter

from app.api.v1.endpoints import admin, ai, auth, patients, sessions

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(patients.router, prefix='/patients', tags=['patients'])
api_router.include_router(admin.router, prefix='/admin', tags=['admin'])
api_router.include_router(sessions.router, prefix='/sessions', tags=['sessions'])
api_router.include_router(ai.router, prefix='/ai', tags=['ai'])
