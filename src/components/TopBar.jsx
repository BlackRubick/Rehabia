import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/login" className="flex items-center gap-3">
          <img
            src="/images/logo.jpeg"
            alt="Logo REHABIA"
            className="h-9 w-9 rounded-xl border border-slate-700/70 object-cover"
          />
          <div>
            <p className="text-base font-bold tracking-wide text-medical-500">REHABIA</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'doctor') && (
                <>
                  <Link className="btn-outline" to="/admin">
                    Panel clínico
                  </Link>
                  <Link className="btn-outline" to="/register">
                    Crear paciente
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link className="btn-outline" to="/doctors">
                  Doctores
                </Link>
              )}
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-slate-300">
                {user.username} · <span className="text-medical-500">{user.role}</span>
              </span>
              <button className="btn-outline" onClick={onLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link className="btn-primary" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
