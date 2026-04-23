const STORAGE_KEY = 'rehabia_mock_assignments';

export const ROM_REFERENCE = [
  { movimiento: 'Extensión', rango: '0°' },
  { movimiento: 'Hiperextensión', rango: '5° - 10° (algunas personas)' },
  { movimiento: 'Flexión', rango: '130° - 150°' },
  { movimiento: 'Rotación interna', rango: '≈10°' },
  { movimiento: 'Rotación externa', rango: '30° - 40°' },
];
 
export const MOCK_PATIENTS_DB = {
  'PAC-2026-A1': {
    unique_id: 'PAC-2026-A1',
    nombre: 'Carlos Ramírez',
    edad: 35,
    lesion: 'Ruptura de LCA',
    rodilla_afectada: 'Derecha',
    actividad_profesion: 'Futbolista amateur',
  },
  'PAC-2026-B2': {
    unique_id: 'PAC-2026-B2',
    nombre: 'María González',
    edad: 28,
    lesion: 'Menisco medial',
    rodilla_afectada: 'Izquierda',
    actividad_profesion: 'Corredora',
  },
  'PAC-2026-C3': {
    unique_id: 'PAC-2026-C3',
    nombre: 'Javier Torres',
    edad: 45,
    lesion: 'Artrosis leve',
    rodilla_afectada: 'Bilateral',
    actividad_profesion: 'Maestro de obra',
  },
};

export const MOCK_STATS_DB = {
  'PAC-2026-A1': [
    { fecha: '2026-03-12T10:30:00', repeticiones_validas: 11, repeticiones_invalidas: 1, angulo_promedio: 108.5 },
    { fecha: '2026-03-10T11:00:00', repeticiones_validas: 9, repeticiones_invalidas: 3, angulo_promedio: 102.1 },
    { fecha: '2026-03-08T09:45:00', repeticiones_validas: 12, repeticiones_invalidas: 0, angulo_promedio: 112.3 },
    { fecha: '2026-03-06T14:20:00', repeticiones_validas: 10, repeticiones_invalidas: 2, angulo_promedio: 105.8 },
    { fecha: '2026-03-04T10:00:00', repeticiones_validas: 8, repeticiones_invalidas: 4, angulo_promedio: 99.4 },
  ],
  'PAC-2026-B2': [
    { fecha: '2026-03-11T08:00:00', repeticiones_validas: 8, repeticiones_invalidas: 4, angulo_promedio: 95.0 },
    { fecha: '2026-03-09T09:30:00', repeticiones_validas: 10, repeticiones_invalidas: 2, angulo_promedio: 100.5 },
    { fecha: '2026-03-07T11:15:00', repeticiones_validas: 7, repeticiones_invalidas: 5, angulo_promedio: 88.3 },
    { fecha: '2026-03-05T13:00:00', repeticiones_validas: 9, repeticiones_invalidas: 3, angulo_promedio: 93.7 },
  ],
  'PAC-2026-C3': [
    { fecha: '2026-03-10T07:45:00', repeticiones_validas: 6, repeticiones_invalidas: 6, angulo_promedio: 78.2 },
    { fecha: '2026-03-08T08:30:00', repeticiones_validas: 7, repeticiones_invalidas: 5, angulo_promedio: 82.0 },
    { fecha: '2026-03-06T09:00:00', repeticiones_validas: 8, repeticiones_invalidas: 4, angulo_promedio: 84.5 },
  ],
};

export const EXERCISE_CATALOG = [
  // Ejercicios originales (General)
  { id: 1, nombre_ejercicio: 'Deslizamiento de talón', categoria: 'General', repeticiones_objetivo: 15, series: 3, angulo_objetivo: 90, rango_min: 0, rango_max: 90, duracion_minutos: 12, indicacion: 'Flexión de rodilla de 0° a 90°.', video_demo_url: 'https://cdn.pixabay.com/video/2019/10/24/28093-370074008_tiny.mp4' },
  { id: 2, nombre_ejercicio: 'Contracción de cuádriceps', categoria: 'General', repeticiones_objetivo: 15, series: 3, angulo_objetivo: 10, rango_min: 0, rango_max: 10, duracion_minutos: 10, indicacion: 'Mantener 5 segundos. 10–15 repeticiones x 3 series.', video_demo_url: '' },
  { id: 3, nombre_ejercicio: 'Elevación de pierna recta', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 20, rango_min: 0, rango_max: 30, duracion_minutos: 10, indicacion: 'Levantar 30 cm manteniendo rodilla extendida.', video_demo_url: '' },
  { id: 4, nombre_ejercicio: 'Flexión pasiva asistida', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 110, rango_min: 0, rango_max: 110, duracion_minutos: 12, indicacion: 'Flexión gradual de 0° a 110°.', video_demo_url: '' },
  { id: 5, nombre_ejercicio: 'Sentadilla parcial', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 45, rango_min: 0, rango_max: 45, duracion_minutos: 10, indicacion: 'Flexión de 0° a 45°.', video_demo_url: '' },
  { id: 6, nombre_ejercicio: 'Step-ups (subir escalón)', categoria: 'General', repeticiones_objetivo: 10, series: 3, angulo_objetivo: 60, rango_min: 0, rango_max: 80, duracion_minutos: 10, indicacion: 'Escalón de 10–20 cm.', video_demo_url: '' },
  { id: 7, nombre_ejercicio: 'Extensión de rodilla sentado', categoria: 'General', repeticiones_objetivo: 15, series: 3, angulo_objetivo: 0, rango_min: 0, rango_max: 90, duracion_minutos: 10, indicacion: 'Movimiento de 90° a 0°.', video_demo_url: '' },
  { id: 8, nombre_ejercicio: 'Curl de isquiotibiales', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 120, rango_min: 0, rango_max: 120, duracion_minutos: 12, indicacion: 'Flexión de 0° a 120°.', video_demo_url: '' },
  { id: 9, nombre_ejercicio: 'Balance en una pierna', categoria: 'General', repeticiones_objetivo: 8, series: 3, angulo_objetivo: 10, rango_min: 0, rango_max: 10, duracion_minutos: 8, indicacion: 'Mantener 20–30 segundos.', video_demo_url: '' },
  { id: 10, nombre_ejercicio: 'Sentadilla completa', categoria: 'General', repeticiones_objetivo: 10, series: 3, angulo_objetivo: 90, rango_min: 0, rango_max: 120, duracion_minutos: 15, indicacion: 'Flexión hasta 90° (hasta 120° en deportistas).', video_demo_url: '' },
  { id: 11, nombre_ejercicio: 'Zancadas (lunges)', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 90, rango_min: 0, rango_max: 90, duracion_minutos: 12, indicacion: 'Flexión controlada hasta 90°.', video_demo_url: '' },
  { id: 12, nombre_ejercicio: 'Puente de glúteos', categoria: 'General', repeticiones_objetivo: 15, series: 3, angulo_objetivo: 20, rango_min: 0, rango_max: 30, duracion_minutos: 10, indicacion: '15 repeticiones x 3 series.', video_demo_url: '' },
  { id: 13, nombre_ejercicio: 'Flexión de rodilla boca abajo', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 120, rango_min: 0, rango_max: 120, duracion_minutos: 12, indicacion: 'Rango de 0°–120°.', video_demo_url: '' },
  { id: 14, nombre_ejercicio: 'Marcha en el lugar', categoria: 'General', repeticiones_objetivo: 20, series: 3, angulo_objetivo: 60, rango_min: 0, rango_max: 60, duracion_minutos: 8, indicacion: 'Rango de 0°–60°.', video_demo_url: '' },
  { id: 15, nombre_ejercicio: 'Elevación alternada de rodillas', categoria: 'General', repeticiones_objetivo: 16, series: 3, angulo_objetivo: 70, rango_min: 0, rango_max: 70, duracion_minutos: 8, indicacion: 'Rango de 0°–70°.', video_demo_url: '' },
  { id: 16, nombre_ejercicio: 'Semi sentadilla', categoria: 'General', repeticiones_objetivo: 15, series: 3, angulo_objetivo: 40, rango_min: 0, rango_max: 40, duracion_minutos: 10, indicacion: 'Rango de 0°–40°.', video_demo_url: '' },
  { id: 17, nombre_ejercicio: 'Paso largo hacia adelante', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 80, rango_min: 0, rango_max: 80, duracion_minutos: 10, indicacion: 'Rango de 0°–80°.', video_demo_url: '' },
  { id: 18, nombre_ejercicio: 'Paso largo hacia atrás', categoria: 'General', repeticiones_objetivo: 12, series: 3, angulo_objetivo: 70, rango_min: 0, rango_max: 70, duracion_minutos: 10, indicacion: 'Rango de 0°–70°.', video_demo_url: '' },
  { id: 19, nombre_ejercicio: 'Paso lateral', categoria: 'General', repeticiones_objetivo: 14, series: 3, angulo_objetivo: 45, rango_min: 0, rango_max: 45, duracion_minutos: 10, indicacion: 'Rango de 0°–45°.', video_demo_url: '' },
  { id: 20, nombre_ejercicio: 'Flexión profunda controlada', categoria: 'General', repeticiones_objetivo: 10, series: 3, angulo_objetivo: 120, rango_min: 0, rango_max: 120, duracion_minutos: 14, indicacion: 'Rango de 0°–120°.', video_demo_url: '' },

  // Ejercicios nuevos clasificados por categoría
  { id: 21, nombre_ejercicio: 'Isométrico femoral sentado', categoria: 'Desgarro (LCA, LCM, LCP, LLE)', repeticiones_objetivo: 12, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 22, nombre_ejercicio: 'Isométrico cuádriceps sentado', categoria: 'Desgarro (LCA, LCM, LCP, LLE)', repeticiones_objetivo: 12, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 23, nombre_ejercicio: 'Isométricos aductores con apoyo en pelota de plástico', categoria: 'Desgarro (LCA, LCM, LCP, LLE)', repeticiones_objetivo: 12, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 24, nombre_ejercicio: 'Bicicleta estática', categoria: 'Desgarro (LCA, LCM, LCP, LLE)', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },

  { id: 25, nombre_ejercicio: 'Puente de glúteos unilateral', categoria: 'Ruptura de menisco (interno y externo)', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 26, nombre_ejercicio: 'Puente con extensión de rodilla', categoria: 'Ruptura de menisco (interno y externo)', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 27, nombre_ejercicio: 'Flexión de piernas con apoyo de TRX', categoria: 'Ruptura de menisco (interno y externo)', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 28, nombre_ejercicio: 'Flexión de rodilla de pie con apoyo', categoria: 'Ruptura de menisco (interno y externo)', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },

  { id: 29, nombre_ejercicio: 'Pasos adelante y atrás con miniband', categoria: 'Fractura de rótula', repeticiones_objetivo: 12, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 30, nombre_ejercicio: 'Media sentadilla', categoria: 'Fractura de rótula', repeticiones_objetivo: 12, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 31, nombre_ejercicio: 'Peso muerto rumano', categoria: 'Fractura de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 32, nombre_ejercicio: 'Curl femoral con máquina declinada', categoria: 'Fractura de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 33, nombre_ejercicio: 'Subir y bajar escalón', categoria: 'Fractura de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },

  { id: 34, nombre_ejercicio: 'Estiramiento de la banda iliotibial de pie', categoria: 'Fractura de platillo tibial', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 35, nombre_ejercicio: 'Media sentadilla isométrica', categoria: 'Fractura de platillo tibial', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 36, nombre_ejercicio: 'Media sentadilla sumo con mancuerna', categoria: 'Fractura de platillo tibial', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 37, nombre_ejercicio: 'Zancada adelante sobre bosu', categoria: 'Fractura de platillo tibial', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },

  { id: 38, nombre_ejercicio: 'Flexión activa de rodilla', categoria: 'Tendinopatía rotuliana', repeticiones_objetivo: 12, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 39, nombre_ejercicio: 'Sentadilla completa con barra', categoria: 'Tendinopatía rotuliana', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 40, nombre_ejercicio: 'Sentadilla estática en posición de zancada', categoria: 'Tendinopatía rotuliana', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 10, indicacion: '', video_demo_url: '' },
  { id: 41, nombre_ejercicio: 'Salto con piernas juntas sobre banco plano', categoria: 'Tendinopatía rotuliana', repeticiones_objetivo: 8, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },

  { id: 42, nombre_ejercicio: 'Curl femoral unilateral', categoria: 'Luxación de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 43, nombre_ejercicio: 'Zancada adelante con kettlebell', categoria: 'Luxación de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 44, nombre_ejercicio: 'Puente sobre pelota de pilates', categoria: 'Luxación de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
  { id: 45, nombre_ejercicio: 'Pedalier sentado', categoria: 'Luxación de rótula', repeticiones_objetivo: 10, series: 3, angulo_objetivo: null, rango_min: null, rango_max: null, duracion_minutos: 8, indicacion: '', video_demo_url: '' },
];

const DEFAULT_ASSIGNMENTS = {
  'PAC-2026-A1': [1, 2, 4, 9],
  'PAC-2026-B2': [5, 7, 14, 19],
  'PAC-2026-C3': [3, 12, 16, 20],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hydrateAssignment(exerciseId, index) {
  const exercise = EXERCISE_CATALOG.find((item) => item.id === exerciseId);
  if (!exercise) return null;
  return {
    ...clone(exercise),
    assigned_id: `${exercise.id}-${index + 1}`,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Dr. Demo',
  };
}

function buildDefaultAssignments() {
  return Object.fromEntries(
    Object.entries(DEFAULT_ASSIGNMENTS).map(([patientId, exerciseIds]) => [
      patientId,
      exerciseIds.map(hydrateAssignment).filter(Boolean),
    ]),
  );
}

export function getAssignmentsMap() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const defaults = buildDefaultAssignments();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    return JSON.parse(saved);
  } catch {
    const defaults = buildDefaultAssignments();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

export function getAssignedRoutines(patientId) {
  const assignments = getAssignmentsMap();
  return clone(assignments[patientId] || []);
}

export function assignRoutineToPatient(patientId, routine) {
  const assignments = getAssignmentsMap();
  const patientAssignments = assignments[patientId] || [];
  const newAssignment = {
    ...clone(routine),
    assigned_id: `assigned-${Date.now()}`,
    assigned_at: new Date().toISOString(),
    assigned_by: 'Dr. Demo',
  };

  assignments[patientId] = [newAssignment, ...patientAssignments];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  return clone(newAssignment);
}

export function removeAssignedRoutine(patientId, assignedId) {
  const assignments = getAssignmentsMap();
  assignments[patientId] = (assignments[patientId] || []).filter((item) => item.assigned_id !== assignedId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  return clone(assignments[patientId]);
}
