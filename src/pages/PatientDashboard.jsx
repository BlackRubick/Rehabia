import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import TherapyCamera from '../components/TherapyCamera';
import { ROM_REFERENCE } from '../lib/mockClinicalData';

// Mapeo de nombre de ejercicio a URL de video
const VIDEO_MAP = {
  "contracción de cuádriceps": "https://www.bing.com/ck/a?!&&p=4e5a6b2ae5357f41d72810c91faf6bef7c8d2e528a3481ba9bb51d0a03a74cd7JmltdHM9MTc3NDEzNzYwMA&ptn=3&ver=2&hsh=4&fclid=2d181146-515f-6ba9-3410-05d1502a6a0a&u=a1L3ZpZGVvcy9yaXZlcnZpZXcvcmVsYXRlZHZpZGVvP3E9Y29udHJhY2NpJWMzJWIzbitkZStjdSVjMyVhMWRyaWNlcHMrdmlkZW8rJiZtaWQ9MjY2NEU2REI0NzFDNjc4Q0RFNUYyNjY0RTZEQjQ3MUM2NzhDREU1RiZGT1JNPVZBTUdaQw",
  "elevación de pierna recta": "https://www.bing.com/videos/riverview/relatedvideo?q=elevaci%c3%b3n+de+pierna+recta++video+como+se+hace&&mid=C959CB4CA219D710069BC959CB4CA219D710069B&FORM=VRDGAR",
  "flexión pasiva asistida": "https://www.bing.com/videos/riverview/relatedvideo?q=flexi%c3%b3n+pasiva+asistida+video+como+se+hace&&mid=7B528482C9DA8E7B70427B528482C9DA8E7B7042&FORM=VRDGAR",
  "sentadilla parcial": "https://www.bing.com/videos/riverview/relatedvideo?q=+sentadilla+parcial+video+como+se+hace&&mid=39ACFDD1FB862F9705BF39ACFDD1FB862F9705BF&FORM=VRDGAR",
  "subir escalon": "https://www.bing.com/videos/riverview/relatedvideo?q=subir+escalon++video+como+se+hace&&mid=F02D568143AD2BDAE432F02D568143AD2BDAE432&FORM=VRDGAR",
  "extensión de rodilla sentada": "https://www.bing.com/videos/riverview/relatedvideo?q=extensi%c3%b3n+de+rodilla+sentada+++video+como+se+hace&&mid=6C1DA71FD31A1C9E2AA76C1DA71FD31A1C9E2AA7&FORM=VRDGAR",
  "curl de isquiotibiales": "https://www.bing.com/videos/riverview/relatedvideo?q=curl+de+isquiotibiales++++video+como+se+hace&&mid=739525452AD8BC9BB708739525452AD8BC9BB708&FORM=VRDGAR",
  "balance en una pierna": "https://www.bing.com/videos/riverview/relatedvideo?q=balance+en+una+pierna+++++video+como+se+hace&&mid=1A4CCAC926814F33341D1A4CCAC926814F33341D&FORM=VRDGAR",
  "zancadas": "https://www.bing.com/videos/riverview/relatedvideo?q=zancadas++video+como+se+hace&&mid=7354AF618D9EBA09A9C97354AF618D9EBA09A9C9&mmscn=stvo&FORM=VRDGAR",
  "puente glúteos": "https://www.bing.com/videos/riverview/relatedvideo?q=puente+gl%c3%bateos+++video+como+se+hace&&mid=DCD4C67820DA40A89D5CDCD4C67820DA40A89D5C&FORM=VRDGAR",
  "flexión de rodilla boca abajo": "https://www.bing.com/videos/riverview/relatedvideo?q=flexi%c3%b3n+de+rodilla+boca+abajo++video+como+se+hace&&mid=BEF734AA25848FF37201BEF734AA25848FF37201&FORM=VRDGAR",
  "marcha en lugar": "https://www.bing.com/videos/riverview/relatedvideo?q=+marcha+en+lugar+++video+como+se+hace&&mid=778CD64187C5DE4D5BF0778CD64187C5DE4D5BF0&FORM=VRDGAR",
  "sentadilla completa": "https://www.bing.com/videos/riverview/relatedvideo?q=+sentadilla+completa+video+como+se+hace&&mid=6A3F4AA36D4966421A8C6A3F4AA36D4966421A8C&FORM=VRDGAR",
  "elevación alternada de rodillas": "https://www.bing.com/videos/riverview/relatedvideo?q=+elevaci%c3%b3n+alternada+de+rodillas+video+como+se+hace&&mid=E5A27F395049705C3C7EE5A27F395049705C3C7E&FORM=VRDGAR",
  "semisentadilla": "https://www.bing.com/videos/riverview/relatedvideo?q=semisentadilla+video+como+se+hace&&mid=5643EB2CE0633AEC9B025643EB2CE0633AEC9B02&mmscn=stvo&FORM=VRDGAR",
  "flexión profunda controlada": "https://www.bing.com/videos/riverview/relatedvideo?q=flexi%c3%b3n+profunda+controlada+video+como+se+hace&&mid=9280CE9A9C2FC046DAFB9280CE9A9C2FC046DAFB&mmscn=stvo&FORM=VRDGAR",
  "desplazamiento de talón": "https://www.bing.com/videos/riverview/relatedvideo?q=+desplazamiento+de+tal%c3%b3n++video+como+se+hace&&mid=72B0A54E19717D21438372B0A54E19717D214383&FORM=VRDGAR"
};

// Función para normalizar nombres de ejercicio
function normalizeName(name) {
  return (name || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
}

const normalizedMap = Object.fromEntries(
  Object.entries(VIDEO_MAP).map(([k, v]) => [normalizeName(k), v])
);

export default function PatientDashboard() {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  const completedRoutineIds = useMemo(() => {
    return new Set(
      history
        .filter((item) => item.cumplio_objetivo && typeof item.rutina_id === 'number')
        .map((item) => item.rutina_id),
    );
  }, [history]);

  const availableRoutines = useMemo(
    () => routines.filter((item) => !completedRoutineIds.has(item.id)),
    [routines, completedRoutineIds],
  );

  useEffect(() => {
    const loadData = async () => {
      const [{ data: routinesData }, { data: sessionsData }] = await Promise.all([
        api.get('/patients/me/routines'),
        api.get('/patients/me/sessions'),
      ]);

      setRoutines(routinesData);
      setSelectedRoutine((current) => {
        const completedIds = new Set(
          sessionsData
            .filter((item) => item.cumplio_objetivo && typeof item.rutina_id === 'number')
            .map((item) => item.rutina_id),
        );

        const selectable = routinesData.filter((item) => !completedIds.has(item.id));
        if (!selectable.length) return null;

        if (current && selectable.some((item) => item.id === current.id)) {
          return selectable.find((item) => item.id === current.id) || selectable[0];
        }
        return selectable[0];
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
      const completedIds = new Set(
        sessionsData
          .filter((item) => item.cumplio_objetivo && typeof item.rutina_id === 'number')
          .map((item) => item.rutina_id),
      );
      const selectable = routinesData.filter((item) => !completedIds.has(item.id));
      setSelectedRoutine((current) => {
        if (!selectable.length) return null;
        if (current && selectable.some((item) => item.id === current.id)) {
          return current;
        }
        return selectable[0];
      });
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
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Panel clínico</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text-main)]">Dashboard del Paciente</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
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
            <p className="text-xs uppercase text-[var(--text-muted)]">{item.label}</p>
            <p className="font-semibold text-[var(--text-main)]">{item.value}</p>
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
                disabled={completedRoutineIds.has(routine.id)}
                onClick={() => setSelectedRoutine(routine)}
                className={`rounded-xl border p-4 text-left transition ${
                  completedRoutineIds.has(routine.id)
                    ? 'cursor-not-allowed border-success/40 bg-success/10 opacity-70'
                    : ''
                } ${
                  selectedRoutine?.id === routine.id
                    ? 'border-[rgba(37,99,235,0.4)] bg-[rgba(37,99,235,0.1)] shadow-lg shadow-[rgba(37,99,235,0.1)]'
                    : 'border-[var(--border-soft)] bg-[var(--surface-2)] hover:border-[var(--text-muted)] hover:bg-[var(--surface-3)]'
                }`}
              >
                <p className="font-semibold text-[var(--text-main)]">{routine.nombre_ejercicio}</p>
                <p className="text-sm text-[var(--text-muted)]">Rango: {routine.rango_min}° - {routine.rango_max}°</p>
                <p className="text-sm text-[var(--text-muted)]">Repeticiones objetivo: {routine.repeticiones_objetivo}</p>
                <p className="text-sm text-[var(--text-muted)]">Duración: {routine.duracion_minutos} min</p>
                {completedRoutineIds.has(routine.id) && (
                  <p className="mt-2 text-xs font-semibold text-success">Ejercicio completado</p>
                )}
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
            <p className="mb-3 mt-1 text-sm text-[var(--text-muted)]">
              Antes de iniciar, revisa el movimiento recomendado.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border-soft)]">
              {(() => {
                const url = normalizedMap[normalizeName(selectedRoutine?.nombre_ejercicio)] || selectedRoutine?.video_demo_url;
                if (url) {
                  return (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-10 text-center text-[var(--medical)] underline"
                    >
                      Ver video demostrativo
                    </a>
                  );
                } else {
                  return (
                    <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">
                      No hay video disponible para este ejercicio.
                    </div>
                  );
                }
              })()}
            </div>
          </div>
          <TherapyCamera routine={selectedRoutine} onFinish={saveSession} />
        </section>
      )}

      {!availableRoutines.length && routines.length > 0 && (
        <section className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          Ya completaste todos tus ejercicios asignados. Espera nuevas rutinas del médico.
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
