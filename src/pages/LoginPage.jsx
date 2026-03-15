import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  .rh-root {
    min-height: 100vh;
    background: #050d1a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  .rh-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 15% 30%, rgba(0,120,255,0.13) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 85% 70%, rgba(0,210,140,0.09) 0%, transparent 65%),
      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,60,160,0.18) 0%, transparent 60%);
    pointer-events: none;
  }

  .rh-grid-lines {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .rh-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 980px;
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 0;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
  }

  @media (max-width: 700px) {
    .rh-wrap { grid-template-columns: 1fr; }
    .rh-left { display: none; }
  }

  .rh-left {
    background: linear-gradient(160deg, #0a1628 0%, #071320 60%, #030b18 100%);
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .rh-left-glow {
    position: absolute;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,110,255,0.18) 0%, transparent 70%);
    top: -80px; left: -80px;
    pointer-events: none;
  }

  .rh-left-glow2 {
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,210,140,0.12) 0%, transparent 70%);
    bottom: 60px; right: -60px;
    pointer-events: none;
  }

  .rh-logo-area { position: relative; z-index: 1; }

  .rh-logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,120,255,0.12);
    border: 1px solid rgba(0,120,255,0.28);
    border-radius: 50px;
    padding: 5px 14px 5px 8px;
    margin-bottom: 1.5rem;
  }

  .rh-logo-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #00c87a;
    box-shadow: 0 0 8px #00c87a;
    animation: rh-pulse 2s ease-in-out infinite;
  }

  @keyframes rh-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .rh-logo-text {
    font-size: 11px;
    font-weight: 500;
    color: rgba(180,210,255,0.8);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .rh-brand {
    font-family: 'Sora', sans-serif;
    font-size: 2.6rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 0.5rem;
  }

  .rh-brand span {
    background: linear-gradient(135deg, #4da6ff 0%, #00e68c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .rh-tagline {
    font-size: 13px;
    color: rgba(160,185,220,0.7);
    line-height: 1.6;
    font-weight: 300;
    max-width: 220px;
  }

  .rh-cards { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }

  .rh-role-card {
    border-radius: 14px;
    padding: 16px 18px;
    border: 1px solid;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s;
  }

  .rh-role-card:hover { transform: translateX(4px); }

  .rh-role-card.patient {
    background: rgba(0,200,120,0.07);
    border-color: rgba(0,200,120,0.2);
  }

  .rh-role-card.admin {
    background: rgba(60,120,255,0.07);
    border-color: rgba(60,120,255,0.2);
  }

  .rh-role-icon { font-size: 18px; margin-bottom: 8px; display: block; }

  .rh-role-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }

  .rh-role-card.patient .rh-role-title { color: #00c87a; }
  .rh-role-card.admin .rh-role-title { color: #5599ff; }

  .rh-role-desc {
    font-size: 12px;
    color: rgba(160,185,220,0.65);
    line-height: 1.5;
    font-weight: 300;
  }

  .rh-left-footer {
    font-size: 11px;
    color: rgba(120,150,190,0.45);
    position: relative; z-index: 1;
  }

  .rh-right {
    background: #07101e;
    padding: 3rem 2.8rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .rh-right-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  .rh-eyebrow {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(100,140,200,0.55);
    margin-bottom: 6px;
  }

  .rh-heading {
    font-family: 'Sora', sans-serif;
    font-size: 1.7rem;
    font-weight: 600;
    color: #e8f0ff;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .rh-sub { font-size: 12px; color: rgba(120,155,210,0.55); margin-top: 4px; }
  .rh-sub span { color: #5599ff; }

  .rh-tabs { display: flex; gap: 6px; }

  .rh-tab {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: rgba(160,190,240,0.6);
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }

  .rh-tab:hover, .rh-tab.active {
    background: rgba(60,130,255,0.15);
    border-color: rgba(60,130,255,0.35);
    color: #7ab8ff;
  }

  .rh-form-group { margin-bottom: 1rem; }

  .rh-label {
    display: block;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(100,140,200,0.55);
    margin-bottom: 8px;
  }

  .rh-input-wrap { position: relative; }

  .rh-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(100,140,200,0.4);
    pointer-events: none;
  }

  .rh-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 13px 14px 13px 42px;
    font-size: 14px;
    color: #d0e4ff;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    outline: none;
  }

  .rh-input::placeholder { color: rgba(100,140,200,0.3); }

  .rh-input:focus {
    border-color: rgba(60,130,255,0.45);
    background: rgba(60,130,255,0.06);
    box-shadow: 0 0 0 3px rgba(60,130,255,0.08);
  }

  .rh-error {
    margin-bottom: 1rem;
    padding: 11px 14px;
    border-radius: 10px;
    background: rgba(220,60,60,0.1);
    border: 1px solid rgba(220,60,60,0.25);
    font-size: 13px;
    color: #ff8080;
  }

  .rh-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    letter-spacing: 0.02em;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #1a5cff 0%, #0043cc 100%);
    color: #fff;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
    margin-top: 0.25rem;
  }

  .rh-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }

  .rh-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 30px rgba(30,90,255,0.4);
  }

  .rh-btn:active { transform: translateY(0); }

  .rh-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 1.4rem 0;
  }

  .rh-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }

  .rh-divider-text {
    font-size: 11px;
    color: rgba(100,140,200,0.35);
    letter-spacing: 0.06em;
  }

  .rh-register {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.065);
    border-radius: 12px;
  }

  .rh-register-text { font-size: 13px; color: rgba(130,165,220,0.6); }

  .rh-link-btn {
    font-size: 12px;
    font-weight: 500;
    color: #5599ff;
    background: rgba(60,130,255,0.1);
    border: 1px solid rgba(60,130,255,0.25);
    border-radius: 8px;
    padding: 6px 14px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
    letter-spacing: 0.02em;
  }

  .rh-link-btn:hover {
    background: rgba(60,130,255,0.18);
    border-color: rgba(60,130,255,0.4);
  }

  .rh-features { display: flex; gap: 10px; margin-top: 1.5rem; }

  .rh-feat {
    flex: 1;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    text-align: center;
  }

  .rh-feat-icon { font-size: 16px; margin-bottom: 4px; display: block; }
  .rh-feat-label { font-size: 10px; color: rgba(120,155,210,0.45); letter-spacing: 0.04em; }

  .rh-demo {
    background: rgba(30, 90, 255, 0.05);
    border: 1px solid rgba(60, 130, 255, 0.18);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 1.4rem;
  }

  .rh-demo-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(100, 150, 255, 0.45);
    margin-bottom: 8px;
    font-family: 'Sora', sans-serif;
  }

  .rh-demo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    margin-bottom: 5px;
    transition: opacity 0.15s;
  }

  .rh-demo-row:last-child { margin-bottom: 0; }
  .rh-demo-row:hover { opacity: 0.75; }

  .rh-demo-badge {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.03em;
    min-width: 58px;
    text-align: center;
  }

  .rh-demo-badge.admin   { background: rgba(255,170,30,0.12); color: #fbbf24; border: 1px solid rgba(255,170,30,0.28); }
  .rh-demo-badge.patient { background: rgba(30,220,150,0.10); color: #34d399; border: 1px solid rgba(30,220,150,0.25); }
  .rh-demo-cred { color: rgba(170,200,255,0.75); font-family: 'Courier New', monospace; }
  .rh-demo-sep  { color: rgba(100,130,180,0.35); margin: 0 2px; }
`;

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form);
      if (user.role === 'admin' || user.role === 'doctor') {
        navigate('/admin');
      } else {
        navigate('/patient');
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Credenciales inválidas');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <main className="rh-root">
        <div className="rh-bg" />
        <div className="rh-grid-lines" />

        <div className="rh-wrap">

          {/* LEFT PANEL */}
          <aside className="rh-left">
            <div className="rh-left-glow" />
            <div className="rh-left-glow2" />

            <div className="rh-logo-area">
              <img
                src="/images/logo.jpeg"
                alt="Logo REHABIA"
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '18px',
                  objectFit: 'cover',
                  border: '1px solid rgba(120,170,255,0.35)',
                  marginBottom: '1rem',
                  boxShadow: '0 14px 36px rgba(0,0,0,0.35)',
                }}
              />
              <div className="rh-logo-badge">
                <div className="rh-logo-dot" />
                <span className="rh-logo-text">IA activa</span>
              </div>
              <div className="rh-brand">REHA<span>BIA</span></div>
              <p className="rh-tagline">
                Rehabilitación de rodilla con visión por computadora e IA clínica avanzada.
              </p>
            </div>

            <div className="rh-cards">
              <div className="rh-role-card patient">
                <span className="rh-role-icon"></span>
                <div className="rh-role-title">Paciente</div>
                <div className="rh-role-desc">
                  Ejercicios guiados por cámara, seguimiento de sesiones y progreso en tiempo real.
                </div>
              </div>
              <div className="rh-role-card admin">
                <span className="rh-role-icon"></span>
                <div className="rh-role-title">Administrador</div>
                <div className="rh-role-desc">
                  Gestión de pacientes, asignación de rutinas y estadísticas clínicas.
                </div>
              </div>
            </div>

            <div className="rh-left-footer">© 2025 REHABIA · Plataforma clínica segura</div>
          </aside>

          {/* RIGHT PANEL */}
          <section className="rh-right">
            <div className="rh-right-top">
              <div>
                <div className="rh-eyebrow">Acceso seguro</div>
                <div className="rh-heading">Iniciar sesión</div>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div className="rh-form-group">
                <label className="rh-label">Usuario</label>
                <div className="rh-input-wrap">
                  <span className="rh-input-icon"><IconUser /></span>
                  <input
                    className="rh-input"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={form.username}
                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="rh-form-group">
                <label className="rh-label">Contraseña</label>
                <div className="rh-input-wrap">
                  <span className="rh-input-icon"><IconLock /></span>
                  <input
                    className="rh-input"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rh-error">{error}</div>
              )}

              <button className="rh-btn" type="submit">
                Entrar a REHABIA
              </button>
            </form>

            <div className="rh-divider">
              <div className="rh-divider-line" />
              <span className="rh-divider-text">¿nuevo en REHABIA?</span>
              <div className="rh-divider-line" />
            </div>

            <div className="rh-register">
              <span className="rh-register-text">¿Eres paciente nuevo?</span>
              <Link to="/register" className="rh-link-btn">Registrarme</Link>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}