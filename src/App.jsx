import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import TVDisplay from './pages/TVDisplay';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated, basePath } = useDashboard();
  if (!isAuthenticated) {
    return <Navigate to={`${basePath}/login`} replace />;
  }
  return children;
}

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TVDisplay />} />
      <Route path="login" element={<Login />} />
      <Route path="admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
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
    return <Navigate to="/" replace />;
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
        {/* Main Dashboard (Universitas Riau) */}
        <Route path="/*" element={
          <DashboardProvider prefix="main" defaultFacultyNameOverride="Universitas Riau">
            <DashboardRoutes />
          </DashboardProvider>
        } />
        
        {/* Faculty Dashboards - Explicitly defined to prevent capturing /login */}
        {facultyList.map(f => (
          <Route key={f} path={`/${f}/*`} element={<FacultyWrapper presetFaculty={f} />} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
