import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import TVDisplay from './pages/TVDisplay';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated, currentUser, basePath, prefix } = useDashboard();
  if (!isAuthenticated && !currentUser) {
    return <Navigate to={basePath ? `${basePath}/login` : '/login'} replace />;
  }

  // Jika akun adalah admin fakultas tertentu (bukan superadmin),
  // pastikan admin diarahkan otomatis ke dasbor fakultasnya sendiri
  if (currentUser && currentUser.role !== 'superadmin' && currentUser.faculty_prefix && currentUser.faculty_prefix !== 'main') {
    if (prefix !== currentUser.faculty_prefix) {
      return <Navigate to={`/${currentUser.faculty_prefix}/admin`} replace />;
    }
  }

  return children;
}

function DashboardRoutes() {
  const { basePath } = useDashboard();
  const adminTarget = basePath ? `${basePath}/admin` : '/admin';

  return (
    <Routes>
      {/* Langsung ke halaman admin saat link dibuka */}
      <Route path="/" element={<Navigate to={adminTarget} replace />} />
      <Route path="tv" element={<TVDisplay />} />
      <Route path="display" element={<TVDisplay />} />
      <Route path="login" element={<Login />} />
      <Route path="admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={adminTarget} replace />} />
    </Routes>
  );
}

function FacultyWrapper({ presetFaculty }) {
  const { faculty: paramFaculty } = useParams();
  const faculty = presetFaculty || paramFaculty;
  
  const faculties = {
    'fkip': 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)',
    'fisip': 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    'feb': 'Fakultas Ekonomi dan Bisnis (FEB)',
    'fmipa': 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)',
    'ft': 'Fakultas Teknik (FT)',
    'fp': 'Fakultas Pertanian (FP)',
    'fpk': 'Fakultas Perikanan dan Kelautan (FPK)',
    'fk': 'Fakultas Kedokteran (FK)',
    'hukum': 'Fakultas Hukum (FH)',
    'fkp': 'Fakultas Keperawatan (FKp)'
  };
  
  const facultyName = faculties[faculty?.toLowerCase()];
  
  if (!facultyName) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <DashboardProvider prefix={faculty.toLowerCase()} defaultFacultyNameOverride={facultyName}>
      <DashboardRoutes />
    </DashboardProvider>
  );
}

const facultyList = ['fkip', 'fisip', 'feb', 'fmipa', 'ft', 'fp', 'fpk', 'fk', 'hukum', 'fkp'];

function App() {
  return (
    <Router>
      <Routes>
        {/* Faculty Dashboards - Explicitly defined first */}
        {facultyList.map(f => (
          <Route key={f} path={`/${f}/*`} element={<FacultyWrapper presetFaculty={f} />} />
        ))}

        {/* Main Dashboard (Universitas Riau) */}
        <Route path="/*" element={
          <DashboardProvider prefix="main" defaultFacultyNameOverride="Universitas Riau (Kantor Pusat)">
            <DashboardRoutes />
          </DashboardProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
