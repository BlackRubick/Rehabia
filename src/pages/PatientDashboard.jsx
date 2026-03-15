import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import TherapyCamera from '../components/TherapyCamera';
import { ROM_REFERENCE } from '../lib/mockClinicalData';

export default function PatientDashboard() {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: routinesData }, { data: sessionsData }] = await Promise.all([
        api.get('/patients/me/routines'),
        api.get('/patients/me/sessions'),
      ]);

      setRoutines(routinesData);
      setSelectedRoutine((current) => {
        if (!routinesData.length) return null;
        if (current && routinesData.some((item) => item.id === current.id)) {
          return routinesData.find((item) => item.id === current.id) || routinesData[0];
        }
        return routinesData[0];
      });
      setHistory(sessionsData);
    };

    loadData().catch((e) => {
      setMessage(e?.response?.data?.detail || 'No fue posible cargar la información del paciente.');
    });
  }, []);

  const completedSessions = history.filter((item) => item.cumplio_objetivo).length;
  const pendingSessions = history.length - completedSessions;

  const summary = useMemo(
    () => [
      { label: 'Ejercicios asignados', value: routines.length },
      { label: 'Sesiones totales', value: history.length },
      { label: 'Sesiones cumplidas', value: completedSessions },
      { label: 'Sesiones pendientes', value: pendingSessions },
    ],
    [completedSessions, history.length, pendingSessions, routines.length],
  );

  const saveSession = async (sessionPayload) => {
    if (!selectedRoutine) return;

    try {
      await api.post('/sessions', {
        ...sessionPayload,
        rutina_id: selectedRoutine.id,
      });

      const [{ data: routinesData }, { data: sessionsData }] = await Promise.all([
        api.get('/patients/me/routines'),
        api.get('/patients/me/sessions'),
      ]);

      setRoutines(routinesData);
      setHistory(sessionsData);
      setMessage('Sesión guardada correctamente.');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage(e?.response?.data?.detail || 'No fue posible guardar la sesión.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <section className="medical-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Panel clínico</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Dashboard del Paciente</h1>
            <p className="mt-2 text-sm text-slate-400">
              Aquí ves los ejercicios que te dejó el médico y tus sesiones registradas.
            </p>
          </div>
          <div className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-sm font-semibold text-success">
            Terapia activa
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="stat-card">
            <p className="text-xs uppercase text-slate-400">{item.label}</p>
            <p className="font-semibold text-slate-100">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="medical-card">
        <h2 className="section-title">Rangos normales de movimiento (ROM)</h2>
        <div className="table-shell mt-3 overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left">
                <th>Movimiento</th>
                <th>Rango normal</th>
              </tr>
            </thead>
            <tbody>
              {ROM_REFERENCE.map((item) => (
                <tr key={item.movimiento}>
                  <td>{item.movimiento}</td>
                  <td>{item.rango}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="medical-card">
        <h2 className="section-title">Ejercicios asignados por el médico</h2>

        {routines.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => setSelectedRoutine(routine)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedRoutine?.id === routine.id
                    ? 'border-medical-500 bg-medical-500/10 shadow-lg shadow-medical-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <p className="font-semibold text-slate-100">{routine.nombre_ejercicio}</p>
                <p className="text-sm text-slate-400">Rango: {routine.rango_min}° - {routine.rango_max}°</p>
                <p className="text-sm text-slate-400">Repeticiones objetivo: {routine.repeticiones_objetivo}</p>
                <p className="text-sm text-slate-400">Duración: {routine.duracion_minutos} min</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Aún no tienes ejercicios asignados. El médico debe asignarlos desde el panel administrador.
          </div>
        )}
      </section>

      {selectedRoutine && (
        <section className="space-y-4">
          <div className="medical-card">
            <h3 className="section-title">Video demostrativo</h3>
            <p className="mb-3 mt-1 text-sm text-slate-400">
              Antes de iniciar, revisa el movimiento recomendado.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <video
                className="h-64 w-full bg-black object-cover"
                controls
                src={selectedRoutine.video_demo_url || 'https://cdn.pixabay.com/video/2019/10/24/28093-370074008_tiny.mp4'}
              />
            </div>
          </div>
          <TherapyCamera routine={selectedRoutine} onFinish={saveSession} />
        </section>
      )}

      <section className="medical-card">
        <h2 className="section-title">Historial reciente</h2>
        <div className="table-shell mt-3 overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left">
                <th>Fecha</th>
                <th>Correctas</th>
                <th>Incorrectas</th>
                <th>Ángulo promedio</th>
                <th>Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.fecha).toLocaleString()}</td>
                  <td className="text-success">{row.repeticiones_validas}</td>
                  <td className="text-danger">{row.repeticiones_invalidas}</td>
                  <td>{row.angulo_promedio}°</td>
                  <td>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.cumplio_objetivo ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                      {row.cumplio_objetivo ? 'Cumplido' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {message && <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">{message}</p>}
    </main>
  );
}
