import { createContext, useContext, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rehabia_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async ({ username, password }) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('rehabia_token', data.access_token);
    localStorage.setItem('rehabia_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('rehabia_token');
    localStorage.removeItem('rehabia_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
