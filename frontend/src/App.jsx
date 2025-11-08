import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import UserCreationPage from './pages/UserCreationPage';
import EditProfile from './pages/EditProfile';
import Dashboard from './pages/Dashboard';
import HiveDashboard from './pages/HiveDashboard';
import CreateHive from './pages/CreateHive';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuthStore();

  // Show loading spinner only briefly, then show login if no user
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen honey-gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
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
        path="/event/:eventId"
        element={
          <ProtectedRoute>
            <EventDetail />
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

