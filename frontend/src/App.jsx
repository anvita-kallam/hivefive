import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import UserCreationPage from './pages/UserCreationPage';
import Dashboard from './pages/Dashboard';
import HiveDashboard from './pages/HiveDashboard';
import CreateHive from './pages/CreateHive';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route
        path="/create-profile"
        element={
          <ProtectedRoute>
            <UserCreationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hive/:hiveId"
        element={
          <ProtectedRoute>
            <HiveDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-hive"
        element={
          <ProtectedRoute>
            <CreateHive />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;

