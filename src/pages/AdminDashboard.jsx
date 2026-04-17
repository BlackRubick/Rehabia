import { useEffect, useMemo, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
// Logo eliminado del PDF
import api from '../lib/api';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  EXERCISE_CATALOG,
} from '../lib/mockClinicalData';
import { useAuth } from '../context/AuthContext';

const baseTemplate = EXERCISE_CATALOG[0];

export default function AdminDashboard() {
  // ...existing code...
  // Eliminar rutina asignada
  const handleDeleteRoutine = async (routineId) => {
    if (!patient || !routineId) return;
    if (!window.confirm('¿Seguro que deseas eliminar este ejercicio asignado?')) return;
    try {
      await api.delete(`/admin/patients/${patient.unique_id}/routines/${routineId}`);
      await syncPatient(patient.unique_id);
      setMessage('Ejercicio eliminado.');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      setMessage('No se pudo eliminar el ejercicio.');
    }
  };
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState([]);
  const [assignedRoutines, setAssignedRoutines] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState(String(baseTemplate.id));
  const [routine, setRoutine] = useState(baseTemplate);
  const [message, setMessage] = useState('');
  const chartRef = useRef();
  // Genera el PDF de historial clínico
  const handleDownloadPDF = async () => {
    if (!patient) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    // Encabezado con logo y título
    // Logo eliminado del PDF
    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text('Historial Clínico', 14, y);
    y += 10;
    doc.setDrawColor('#2563eb');
    doc.setLineWidth(1);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    // Tarjeta de datos del paciente
    doc.setFillColor('#f1f5f9');
    doc.roundedRect(14, y, pageWidth - 28, 28, 4, 4, 'F');
    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text(`Nombre:`, 18, y + 8);
    doc.text(`${patient.nombre || ''}`, 45, y + 8);
    doc.text(`ID:`, 18, y + 16);
    doc.text(`${patient.unique_id || ''}`, 45, y + 16);
    doc.text(`Edad:`, pageWidth / 2, y + 8);
    doc.text(`${patient.edad || ''}`, pageWidth / 2 + 20, y + 8);
    doc.text(`Lesión:`, pageWidth / 2, y + 16);
    doc.text(`${patient.lesion || ''}`, pageWidth / 2 + 20, y + 16);
    y += 34;

    // Tabla de historial de sesiones
    let tableY = y;
    if (stats.length > 0) {
      autoTable(doc, {
        startY: tableY,
        head: [['Fecha', '✔️ Correctas', '❌ Malas', 'Ángulo']],
        body: stats.map((item) => [
          new Date(item.fecha).toLocaleDateString(),
          item.repeticiones_validas,
          item.repeticiones_invalidas,
          item.angulo_promedio,
        ]),
        theme: 'striped',
        styles: {
          fillColor: [241, 245, 249],
          textColor: '#0f172a',
          fontSize: 11,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: '#fff',
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
        margin: { left: 14, right: 14 },
        tableLineColor: [203, 213, 225],
        tableLineWidth: 0.2,
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Gráfica de progreso como imagen
    if (chartRef.current) {
      doc.setFontSize(14);
      doc.setTextColor('#2563eb');
      doc.text('Gráfica de progreso', pageWidth / 2, y, { align: 'center' });
      y += 4;
      const chartElem = chartRef.current;
      try {
        const canvas = await html2canvas(chartElem, { backgroundColor: '#fff', scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const imgWidth = pageWidth - 48;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(imgData, 'PNG', 24, y, imgWidth, imgHeight);
        y += imgHeight + 8;
      } catch (err) {
        // fallback: no image
      }
    }

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor('#64748b');
    doc.text(`Generado por Rehabia · ${new Date().toLocaleDateString()}`, 14, 290);

    doc.save(`historial_${patient.unique_id || 'paciente'}.pdf`);
  };

  const syncPatient = async (nextPatientId) => {
    const key = nextPatientId.trim().toUpperCase();
    try {
      const [{ data: patientData }, { data: statsData }, { data: routinesData }] = await Promise.all([
        api.get(`/admin/patients/${key}`),
        api.get(`/admin/patients/${key}/stats`),
        api.get(`/admin/patients/${key}/routines`),
      ]);

      setPatientId(key);
      setPatient(patientData);
      setStats(statsData);
      setAssignedRoutines(routinesData);
      setMessage('');
    } catch (e) {
      setPatient(null);
      setStats([]);
      setAssignedRoutines([]);
      setMessage(e?.response?.data?.detail || `Paciente "${nextPatientId}" no encontrado.`);
    }
  };

  useEffect(() => {
    api
      .get('/admin/patients')
      .then(async ({ data }) => {
        setPatients(data);
        if (data.length > 0) {
          await syncPatient(data[0].unique_id);
        }
      })
      .catch(() => {
        setPatients([]);
      });
  }, []);

  useEffect(() => {
    if (isDoctor) {
      setDoctors([]);
      return;
    }

    api
      .get('/admin/doctors')
      .then(({ data }) => setDoctors(data))
      .catch(() => {
        setDoctors([]);
      });
  }, [isDoctor]);

  const searchPatient = async () => {
    await syncPatient(patientId);
  };

  const onExerciseChange = (exerciseId) => {
    setSelectedExerciseId(exerciseId);
    const exercise = EXERCISE_CATALOG.find((item) => String(item.id) === String(exerciseId));
    if (exercise) {
      setRoutine(exercise);
    }
  };

  const assignRoutine = async (event) => {
    event.preventDefault();
    if (!patient) return;
    try {
      await api.post(`/admin/patients/${patient.unique_id}/routines`, {
        nombre_ejercicio: routine.nombre_ejercicio,
        repeticiones_objetivo: Number(routine.repeticiones_objetivo),
        rango_min: Number(routine.rango_min),
        rango_max: Number(routine.rango_max),
        duracion_minutos: Number(routine.duracion_minutos),
        video_demo_url: routine.video_demo_url || '',
      });

      await syncPatient(patient.unique_id);
      setMessage(`✓ Ejercicio asignado a ${patient.nombre}.`);
      setTimeout(() => setMessage(''), 3500);
    } catch (e) {
      setMessage(e?.response?.data?.detail || 'No fue posible asignar la rutina.');
    }
  };

  const progressData = stats.map((item) => ({
    fecha: new Date(item.fecha).toLocaleDateString(),
    correctas: item.repeticiones_validas,
    incorrectas: item.repeticiones_invalidas,
    angulo: item.angulo_promedio,
  }));

  const totals = stats.reduce(
    (acc, row) => {
      acc.valid += row.repeticiones_validas;
      acc.invalid += row.repeticiones_invalidas;
      acc.angle += row.angulo_promedio;
      return acc;
    },
    { valid: 0, invalid: 0, angle: 0 },
  );

  const progressPct = stats.length
    ? Math.round((totals.valid / Math.max(totals.valid + totals.invalid, 1)) * 100)
    : 0;

  const avgAngle = stats.length ? (totals.angle / stats.length).toFixed(2) : '0';

  const dashboardSummary = useMemo(
    () => [
      { label: 'Paciente', value: patient?.nombre || 'Sin seleccionar' },
      { label: 'Lesión', value: patient?.lesion || '—' },
      { label: 'Progreso', value: `${progressPct}%` },
      { label: 'Ejercicios activos', value: assignedRoutines.length },
    ],
    [assignedRoutines.length, patient?.lesion, patient?.nombre, progressPct],
  );

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <section className="medical-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text-main)]">{isDoctor ? 'Dashboard Doctor' : 'Dashboard Administrador'}</h1>
          </div>
          <span className="rounded-full border border-[rgba(37,99,235,0.4)] bg-[rgba(37,99,235,0.1)] px-3 py-1 text-sm font-semibold text-[var(--medical)]">
            Control clínico
          </span>
        </div>
      </section>

      <section className="medical-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Lista de pacientes</h2>
          <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-muted)]">
            Total: {patients.length}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            className="field min-w-[280px]"
            value={patientId}
            onChange={(event) => {
              const nextId = event.target.value;
              setPatientId(nextId);
              if (nextId) {
                syncPatient(nextId);
              }
            }}
          >
            <option value="">Selecciona un paciente...</option>
            {patients.map((patientItem) => (
              <option key={patientItem.unique_id} value={patientItem.unique_id}>
                {patientItem.nombre} ({patientItem.unique_id})
              </option>
            ))}
          </select>
        </div>

        {patients.length === 0 && (
          <p className="mt-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-muted)]">
            No hay pacientes registrados todavía.
          </p>
        )}
      </section>

      {!isDoctor && (
        <section className="medical-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">Doctores registrados</h2>
            <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-muted)]">
              Total: {doctors.length}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <article key={doctor.id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
                <p className="font-semibold text-[var(--text-main)]">{doctor.username}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">ID: {doctor.id}</p>
                <span className="mt-2 inline-flex rounded-full bg-[color:var(--medical)]/15 px-2 py-1 text-xs font-semibold text-[var(--medical)]">
                  {doctor.role}
                </span>
              </article>
            ))}
            {doctors.length === 0 && (
              <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">
                No hay doctores registrados todavía.
              </div>
            )}
          </div>
        </section>
      )}

      <section className="medical-card">
        <h2 className="section-title">Buscar paciente por ID</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            className="field max-w-xs"
            placeholder="Ej: PAC-2026-A1"
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && searchPatient()}
          />
          <button className="btn-primary" onClick={searchPatient}>
            Buscar
          </button>
        </div>
        {message && <p className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">{message}</p>}
      </section>

      {patient && (
        <>
          <div className="flex justify-end mb-2">
            <button className="btn-primary" onClick={handleDownloadPDF}>
              Descargar PDF
            </button>
          </div>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dashboardSummary.map((item) => (
              <div key={item.label} className="stat-card">
                <p className="text-xs uppercase text-[var(--text-muted)]">{item.label}</p>
                <p className="font-semibold text-[var(--text-main)]">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="medical-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Ejercicios actualmente asignados</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Esto es exactamente lo que verá el paciente en su dashboard.
                </p>
              </div>
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-muted)]">
                Ángulo promedio: {avgAngle}°
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {assignedRoutines.map((item) => (
                <article key={item.id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[var(--text-main)]">{item.nombre_ejercicio}</p>
                    <button
                      className="btn-danger text-xs px-2 py-1 ml-2"
                      title="Eliminar ejercicio"
                      onClick={() => handleDeleteRoutine(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">Rango: {item.rango_min}° - {item.rango_max}°</p>
                  <p className="text-sm text-[var(--text-muted)]">Repeticiones: {item.repeticiones_objetivo}</p>
                  <p className="text-sm text-[var(--text-muted)]">Duración: {item.duracion_minutos} min</p>
                </article>
              ))}
            </div>
          </section>

          <section className="medical-card">
            <h2 className="section-title">Asignación de ejercicios</h2>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={assignRoutine}>
              <select className="field" value={selectedExerciseId} onChange={(event) => onExerciseChange(event.target.value)}>
                {EXERCISE_CATALOG.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.nombre_ejercicio}
                  </option>
                ))}
              </select>
              <input className="field" value={routine.nombre_ejercicio} onChange={(event) => setRoutine((prev) => ({ ...prev, nombre_ejercicio: event.target.value }))} />
              <input className="field" type="number" value={routine.repeticiones_objetivo} onChange={(event) => setRoutine((prev) => ({ ...prev, repeticiones_objetivo: event.target.value }))} />
              <input className="field" type="number" value={routine.rango_min} onChange={(event) => setRoutine((prev) => ({ ...prev, rango_min: event.target.value }))} />
              <input className="field" type="number" value={routine.rango_max} onChange={(event) => setRoutine((prev) => ({ ...prev, rango_max: event.target.value }))} />
              <input className="field" type="number" value={routine.duracion_minutos} onChange={(event) => setRoutine((prev) => ({ ...prev, duracion_minutos: event.target.value }))} />
              <input className="field md:col-span-2" value={routine.video_demo_url || ''} onChange={(event) => setRoutine((prev) => ({ ...prev, video_demo_url: event.target.value }))} placeholder="URL de video demostrativo (opcional)" />
              <button className="btn-primary md:col-span-2" type="submit">Asignar al paciente</button>
            </form>
          </section>

          <section className="medical-card">
            <h2 className="section-title">Gráficos de progreso</h2>
            <div className="mt-4 h-80 w-full min-w-0 min-h-0" ref={chartRef} id="progress-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 24, right: 32, left: 8, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#64748b"
                    tick={{ fontSize: 13 }}
                    angle={-20}
                    height={60}
                    label={{ value: 'Fecha', position: 'insideBottom', offset: -18, fill: '#64748b', fontSize: 14 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 13 }}
                    label={{ value: 'Valor', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 14 }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 600 }}
                    formatter={(value, name) => {
                      if (name === 'correctas') return [`${value} correctas`, '✔️ Correctas'];
                      if (name === 'incorrectas') return [`${value} malas`, '❌ Malas'];
                      if (name === 'angulo') return [`${value}°`, 'Ángulo'];
                      return [value, name];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="correctas"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#22c55e', stroke: '#fff', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incorrectas"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="angulo"
                    stroke="#3b82f6"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
