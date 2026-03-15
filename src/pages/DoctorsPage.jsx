import { useEffect, useState } from 'react';
import api from '../lib/api';

const initialDoctor = { username: '', password: '' };
const initialEdit = { id: null, username: '', password: '' };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialDoctor);
  const [editing, setEditing] = useState(initialEdit);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    const { data } = await api.get('/admin/doctors');
    setDoctors(data);
  };

  useEffect(() => {
    loadDoctors().catch((e) => {
      setError(e?.response?.data?.detail || 'No fue posible cargar los doctores.');
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/admin/doctors', form);
      setForm(initialDoctor);
      setMessage('Doctor creado correctamente.');
      await loadDoctors();
    } catch (e) {
      setError(e?.response?.data?.detail || 'No fue posible crear el doctor.');
    }
  };

  const startEdit = (doctor) => {
    setEditing({ id: doctor.id, username: doctor.username, password: '' });
    setError('');
    setMessage('');
  };

  const cancelEdit = () => {
    setEditing(initialEdit);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editing.id) return;

    setError('');
    setMessage('');

    const payload = {};
    if (editing.username.trim()) payload.username = editing.username.trim();
    if (editing.password.trim()) payload.password = editing.password.trim();

    try {
      await api.put(`/admin/doctors/${editing.id}`, payload);
      setMessage('Doctor actualizado correctamente.');
      setEditing(initialEdit);
      await loadDoctors();
    } catch (e) {
      setError(e?.response?.data?.detail || 'No fue posible actualizar el doctor.');
    }
  };

  const removeDoctor = async (doctor) => {
    const confirmed = window.confirm(`¿Eliminar al doctor ${doctor.username}?`);
    if (!confirmed) return;

    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/doctors/${doctor.id}`);
      setMessage('Doctor eliminado correctamente.');
      if (editing.id === doctor.id) {
        setEditing(initialEdit);
      }
      await loadDoctors();
    } catch (e) {
      setError(e?.response?.data?.detail || 'No fue posible eliminar el doctor.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <section className="medical-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Administración</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Gestión de doctores</h1>
            <p className="mt-2 text-sm text-slate-400">
              Desde aquí el admin crea cuentas para que los doctores inicien sesión y registren pacientes.
            </p>
          </div>
          <span className="rounded-full border border-medical-500/40 bg-medical-500/10 px-3 py-1 text-sm font-semibold text-medical-500">
            Solo admin
          </span>
        </div>
      </section>

      <section className="medical-card">
        <h2 className="section-title">Crear doctor</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <input
            className="field"
            placeholder="Usuario del doctor"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
          <input
            className="field"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <button className="btn-primary md:col-span-2" type="submit">
            Crear doctor
          </button>
        </form>

        {message && <p className="mt-3 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">{message}</p>}
        {error && <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      </section>

      <section className="medical-card">
        <h2 className="section-title">Doctores registrados</h2>
        <div className="table-shell mt-3 overflow-x-auto">
          <table>
            <thead>
              <tr className="text-left">
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>
                    {editing.id === doctor.id ? (
                      <input
                        className="field"
                        value={editing.username}
                        onChange={(e) => setEditing((prev) => ({ ...prev, username: e.target.value }))}
                      />
                    ) : (
                      doctor.username
                    )}
                  </td>
                  <td>
                    <span className="rounded-full bg-medical-500/15 px-2 py-1 text-xs font-semibold text-medical-400">
                      {doctor.role}
                    </span>
                  </td>
                  <td>
                    {editing.id === doctor.id ? (
                      <form className="flex flex-wrap gap-2" onSubmit={saveEdit}>
                        <input
                          className="field max-w-[180px]"
                          type="password"
                          placeholder="Nueva contraseña (opcional)"
                          value={editing.password}
                          onChange={(e) => setEditing((prev) => ({ ...prev, password: e.target.value }))}
                        />
                        <button className="btn-primary" type="submit">Guardar</button>
                        <button className="btn-secondary" type="button" onClick={cancelEdit}>Cancelar</button>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <button className="btn-secondary" type="button" onClick={() => startEdit(doctor)}>Editar</button>
                        <button className="rounded-lg border border-danger/50 bg-danger/10 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/20" type="button" onClick={() => removeDoctor(doctor)}>Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
