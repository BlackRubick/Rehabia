import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const initialState = {
  nombre: '',
  edad: '',
  lesion: '',
  rodilla_afectada: 'izquierda',
  actividad_profesion: '',
  username: '',
  password: '',
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .rp-root {
    min-height: 100vh;
    background: radial-gradient(circle at 10% 0%, rgba(37,99,235,0.08), transparent 36%), var(--bg-app);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 2.5rem 1rem;
    position: relative;
    overflow: hidden;
  }

  .rp-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 55% 45% at 10% 20%, rgba(37,99,235,0.1) 0%, transparent 65%),
      radial-gradient(ellipse 45% 40% at 90% 80%, rgba(34,197,94,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 70% 50% at 50% 110%, rgba(37,99,235,0.08) 0%, transparent 55%);
    pointer-events: none;
  }

  .rp-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .rp-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 700px;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-soft), 0 0 0 1px rgba(255,255,255,0.03) inset;
    background: var(--bg-panel);
  }

  /* TOP HEADER BAND */
  .rp-header {
    background: linear-gradient(160deg, var(--surface-2) 0%, var(--bg-panel) 100%);
    border-bottom: 1px solid var(--border-soft);
    padding: 2rem 2.5rem 1.8rem;
    position: relative;
    overflow: hidden;
  }

  .rp-header-glow {
    position: absolute;
    width: 300px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
    top: -80px; right: -60px;
    pointer-events: none;
  }

  .rp-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.8rem;
  }

  .rp-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.22);
    border-radius: 50px;
    padding: 4px 12px 4px 7px;
  }

  .rp-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 7px #22c55e;
    animation: rp-pulse 2s ease-in-out infinite;
  }

  @keyframes rp-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .rp-badge-text {
    font-size: 10px;
    font-weight: 500;
    color: var(--success);
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .rp-step-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .rp-step-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
  }

  .rp-step-dot.active {
    width: 20px;
    border-radius: 3px;
    background: var(--medical);
  }

  .rp-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.55rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .rp-subtitle {
    font-size: 12.5px;
    color: var(--text-muted);
    margin-top: 4px;
    font-weight: 300;
  }

  /* BODY */
  .rp-body { padding: 2rem 2.5rem 2.5rem; }

  /* SECTION LABEL */
  .rp-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }

  .rp-section-label:first-child { margin-top: 0; }

  .rp-section-icon {
    width: 26px; height: 26px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }

  .rp-section-icon.blue { background: rgba(60,130,255,0.15); }
  .rp-section-icon.green { background: rgba(0,200,120,0.12); }

  .rp-section-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    font-weight: 500;
  }

  .rp-section-line {
    flex: 1;
    height: 1px;
    background: var(--border-soft);
  }

  /* GRID */
  .rp-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .rp-full { grid-column: 1 / -1; }

  @media (max-width: 520px) {
    .rp-grid-2 { grid-template-columns: 1fr; }
    .rp-full { grid-column: 1; }
    .rp-header { padding: 1.5rem 1.5rem 1.4rem; }
    .rp-body { padding: 1.5rem 1.5rem 2rem; }
  }

  /* FIELD */
  .rp-field-wrap { position: relative; }

  .rp-field-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    display: flex; align-items: center;
  }

  .rp-input, .rp-select {
    width: 100%;
    background: var(--bg-panel);
    border: 1px solid var(--border-soft);
    border-radius: 11px;
    padding: 12px 13px 12px 40px;
    font-size: 13.5px;
    color: var(--text-main);
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .rp-input::placeholder { color: var(--text-muted); }

  .rp-input:focus, .rp-select:focus {
    border-color: rgba(37,99,235,0.4);
    background: var(--surface-2);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.07);
  }

  .rp-select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(100,116,139,0.55)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 13px center;
    padding-right: 36px;
  }

  .rp-select option {
    background: var(--bg-panel);
    color: var(--text-main);
  }

  /* ERROR */
  .rp-error {
    grid-column: 1 / -1;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(220,38,38,0.08);
    border: 1px solid rgba(220,38,38,0.22);
    font-size: 13px;
    color: #ff8080;
  }

  /* ACTIONS */
  .rp-actions {
    display: flex;
    gap: 10px;
    margin-top: 1.6rem;
    flex-wrap: wrap;
  }

  .rp-btn-primary {
    flex: 1;
    min-width: 160px;
    padding: 13px 20px;
    border-radius: 11px;
    font-size: 13.5px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    letter-spacing: 0.02em;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: #fff;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .rp-btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.11) 0%, transparent 55%);
    pointer-events: none;
  }

  .rp-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(37,99,235,0.32);
  }

  .rp-btn-primary:active { transform: translateY(0); }

  .rp-btn-ghost {
    padding: 13px 18px;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    background: var(--bg-panel);
    border: 1px solid var(--border-soft);
    color: var(--text-muted);
    transition: all 0.18s;
    white-space: nowrap;
  }

  .rp-btn-ghost:hover {
    background: rgba(37,99,235,0.08);
    border-color: rgba(37,99,235,0.28);
    color: var(--medical);
  }

  /* SUCCESS */
  .rp-success {
    margin-top: 1.4rem;
    border-radius: 14px;
    border: 1px solid rgba(34,197,94,0.22);
    background: rgba(34,197,94,0.07);
    padding: 1.2rem 1.4rem;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    animation: rp-fadeIn 0.4s ease;
  }

  @keyframes rp-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .rp-success-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: rgba(34,197,94,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .rp-success-title {
    font-size: 13px;
    font-weight: 600;
    color: #16a34a;
    margin-bottom: 6px;
    font-family: 'Sora', sans-serif;
  }

  .rp-success-text {
    font-size: 12.5px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .rp-id-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.28);
    border-radius: 8px;
    padding: 5px 12px;
    margin-top: 8px;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #16a34a;
    letter-spacing: 0.06em;
  }
`;

const IconPerson = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconAge = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconKnee = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L8 8l4 4-4 6h8l-4-6 4-4-4-6z"/>
  </svg>
);

const IconWork = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconSelect = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
  </svg>
);

export default function RegisterPatientPage() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/patients/register', {
        ...form,
        edad: Number(form.edad),
      });
      setResult(data);
      setForm(initialState);
    } catch (e) {
      setError(e?.response?.data?.detail || 'No fue posible registrar el paciente');
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <>
      <style>{styles}</style>
      <main className="rp-root">
        <div className="rp-bg" />
        <div className="rp-grid" />

        <div className="rp-wrap">

          {/* HEADER */}
          <div className="rp-header">
            <div className="rp-header-glow" />
            <div className="rp-header-top">
              <div className="rp-badge">
                <div className="rp-badge-dot" />
                <span className="rp-badge-text">Nuevo paciente</span>
              </div>
              <div className="rp-step-indicator">
                <div className="rp-step-dot active" />
                <div className="rp-step-dot" />
                <div className="rp-step-dot" />
              </div>
            </div>
            <div className="rp-title">Registro de Paciente</div>
            <div className="rp-subtitle">Se generará automáticamente un ID único de paciente.</div>
          </div>

          {/* BODY */}
          <div className="rp-body">
            <form onSubmit={onSubmit}>

              {/* SECCIÓN: Datos clínicos */}
              <div className="rp-section-label">
                <div className="rp-section-icon blue">🦴</div>
                <span className="rp-section-title">Datos clínicos</span>
                <div className="rp-section-line" />
              </div>

              <div className="rp-grid-2">
                <div className="rp-field-wrap">
                  <span className="rp-field-icon"><IconPerson /></span>
                  <input
                    className="rp-input"
                    placeholder="Nombre completo"
                    value={form.nombre}
                    onChange={set('nombre')}
                    required
                  />
                </div>

                <div className="rp-field-wrap">
                  <span className="rp-field-icon"><IconAge /></span>
                  <input
                    className="rp-input"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Edad"
                    value={form.edad}
                    onChange={set('edad')}
                    required
                  />
                </div>

                <div className="rp-field-wrap rp-full">
                  <span className="rp-field-icon"><IconKnee /></span>
                  <input
                    className="rp-input"
                    placeholder="Diagnóstico / Lesión"
                    value={form.lesion}
                    onChange={set('lesion')}
                    required
                  />
                </div>

                <div className="rp-field-wrap rp-full">
                  <span className="rp-field-icon"><IconSelect /></span>
                  <select
                    className="rp-select"
                    value={form.rodilla_afectada}
                    onChange={set('rodilla_afectada')}
                    required
                  >
                    <option value="izquierda">Rodilla izquierda</option>
                    <option value="derecha">Rodilla derecha</option>
                    <option value="ambas">Ambas</option>
                  </select>
                </div>

                <div className="rp-field-wrap rp-full">
                  <span className="rp-field-icon"><IconWork /></span>
                  <input
                    className="rp-input"
                    placeholder="Actividad o profesión"
                    value={form.actividad_profesion}
                    onChange={set('actividad_profesion')}
                    required
                  />
                </div>
              </div>

              {/* SECCIÓN: Acceso al sistema */}
              <div className="rp-section-label">
                <div className="rp-section-icon green">🔐</div>
                <span className="rp-section-title">Acceso al sistema</span>
                <div className="rp-section-line" />
              </div>

              <div className="rp-grid-2">
                <div className="rp-field-wrap">
                  <span className="rp-field-icon"><IconUser /></span>
                  <input
                    className="rp-input"
                    placeholder="Nombre de usuario"
                    value={form.username}
                    onChange={set('username')}
                    required
                  />
                </div>

                <div className="rp-field-wrap">
                  <span className="rp-field-icon"><IconLock /></span>
                  <input
                    className="rp-input"
                    type="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                </div>

                {error && <div className="rp-error">{error}</div>}
              </div>

              <div className="rp-actions">
                <button className="rp-btn-primary" type="submit">
                  Registrar paciente
                </button>
                <button
                  className="rp-btn-ghost"
                  type="button"
                  onClick={() => navigate('/login?role=patient')}
                >
                  Ir a iniciar sesión
                </button>
              </div>
            </form>

            {result && (
              <div className="rp-success">
                <div className="rp-success-icon">✓</div>
                <div>
                  <div className="rp-success-title">Paciente registrado correctamente</div>
                  <div className="rp-success-text">El paciente ya puede iniciar sesión con sus credenciales.</div>
                  <div className="rp-id-chip">
                    ID: {result.patient_unique_id}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
