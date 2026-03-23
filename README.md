# REHABIA

## Stack

- Frontend: React + TailwindCSS + Vite
- Backend: FastAPI (Python)
- IA: OpenCV + MediaPipe Pose
- Base de datos: MySQL
- ORM: SQLAlchemy
- Auth: JWT

## Funcionalidades implementadas

### Paciente
- Registro con datos clínicos y generación automática de ID único (`PAC-YYYY-XXXXXX`)
- Inicio de sesión
- Visualización de rutinas asignadas
- Reproducción de video demostrativo previo
- Sesión de terapia con cámara:
  - superposición de esqueleto
  - cálculo de ángulo cadera → rodilla → tobillo
  - feedback visual por estado (correcto / fuera de rango)
  - contador de repeticiones válidas e inválidas
- Guardado de resultados en base de datos
- Historial de sesiones

### Administrador (fisioterapeuta / quiropráctico)
- Búsqueda de paciente por ID único
- Visualización de historial, lesión y progreso
- Asignación/modificación de rutina personalizada:
  - nombre de ejercicio
  - repeticiones objetivo
  - rango de ángulo mínimo/máximo
  - duración￼
  - video demostrativo
- Estadísticas y gráficos de progreso

## Estructura del proyecto

- [src/App.jsx](src/App.jsx)
- [src/components/TherapyCamera.jsx](src/components/TherapyCamera.jsx)
- [src/pages/AdminDashboard.jsx](src/pages/AdminDashboard.jsx)
- [src/pages/PatientDashboard.jsx](src/pages/PatientDashboard.jsx)
- [backend/app/main.py](backend/app/main.py)
- [backend/app/api/v1/router.py](backend/app/api/v1/router.py)
- [backend/app/models/patient.py](backend/app/models/patient.py)
- [backend/app/models/routine.py](backend/app/models/routine.py)
- [backend/app/models/session.py](backend/app/models/session.py)
- [backend/app/models/user.py](backend/app/models/user.py)
- [backend/app/services/pose_analyzer.py](backend/app/services/pose_analyzer.py)

## Esquema de base de datos (MySQL)

Tablas principales:

- `pacientes`
  - `id` (PK)
  - `unique_id`
  - `nombre`
  - `edad`
  - `lesion`
  - `rodilla_afectada`
  - `actividad_profesion`
  - `rango_min`
  - `rango_max`
  - `fecha_registro`

- `rutinas`
  - `id` (PK)
  - `paciente_id` (FK)
  - `nombre_ejercicio`
  - `repeticiones_objetivo`
  - `angulo_objetivo`
  - `rango_min`
  - `rango_max`
  - `duracion_minutos`
  - `video_demo_url`
  - `fecha_asignacion`

- `sesiones`
  - `id` (PK)
  - `paciente_id` (FK)
  - `rutina_id` (FK)
  - `fecha`
  - `repeticiones_validas`
  - `repeticiones_invalidas`
  - `angulo_promedio`
  - `cumplio_objetivo`

## Instalación

### 1) Frontend

1. Copia variables de entorno:
	- `cp .env.example .env`
2. Instala dependencias:
	- `npm install`
3. Ejecuta entorno de desarrollo:
	- `npm run dev`

Script opcional:

- [scripts/setup_frontend.sh](scripts/setup_frontend.sh)

### 2) Base de datos MySQL

Ejecuta el script:

- [backend/scripts/init_db.sql](backend/scripts/init_db.sql)

### 3) Backend FastAPI

1. Ve al backend:
	- `cd backend`
2. Crea entorno virtual:
	- `python -m venv .venv`
3. Activa entorno virtual (Linux/macOS):
	- `source .venv/bin/activate`
4. Instala dependencias:
	- `pip install -r requirements.txt`
5. Copia variables de entorno:
	- `cp .env.example .env`
6. Ejecuta API:
	- `uvicorn app.main:app --reload --port 8000`

Script opcional:

- [backend/scripts/setup_backend.sh](backend/scripts/setup_backend.sh)

### 4) Crear usuario administrador

Desde [backend](backend):

- `python -m scripts.seed_admin`

Credenciales por defecto:

- usuario: `admin`
- contraseña: `admin123`

## Arranque conjunto (opcional)

Si ya configuraste frontend y backend:

- [scripts/run_all.sh](scripts/run_all.sh)

## Endpoints principales

### Auth
- `POST /api/v1/auth/login`

### Pacientes
- `POST /api/v1/patients/register`
- `GET /api/v1/patients/me/routines`
- `GET /api/v1/patients/me/sessions`

### Admin
- `GET /api/v1/admin/patients/{patient_unique_id}`
- `POST /api/v1/admin/patients/{patient_unique_id}/routines`
- `GET /api/v1/admin/patients/{patient_unique_id}/stats`

### Sesiones
- `POST /api/v1/sessions`

### IA
- `POST /api/v1/ai/analyze`

## Flujo IA

1. Detección de landmarks con MediaPipe Pose.
2. Selección de cadera, rodilla y tobillo según lado afectado.
3. Cálculo de ángulo con producto punto entre vectores:

$$
	heta = \arccos\left(\frac{\vec{BA} \cdot \vec{BC}}{\|\vec{BA}\|\,\|\vec{BC}\|}\right)
$$

4. Validación contra rango permitido del ejercicio.
5. Conteo de repetición al completar ciclo de movimiento dentro de la lógica de fases.



