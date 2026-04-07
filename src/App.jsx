import { Navigate, Route, Routes } from 'react-router-dom';
import TopBar from './components/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import DoctorsPage from './pages/DoctorsPage';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import RegisterPatientPage from './pages/RegisterPatientPage';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300" data-theme={theme}>
      <TopBar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPatientPage />} />
        <Route
          path="/patient"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={['admin', 'doctor']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute role="admin">
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}