import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReferenceValuesProvider } from './contexts/ReferenceValuesContext';
import LoginPage from './pages/auth/LoginPage';
import CreateAccountPage from './pages/auth/CreateAccountPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CustomersPage from './pages/customers/CustomersPage';
import JobsPage from './pages/jobs/JobsPage';
import ViewJobPage from './pages/jobs/ViewJobPage';
import PartsPage from './pages/parts/PartsPage';
import UsersPage from './pages/users/UsersPage';
import InitiativeSummaryPage from './pages/initiatives/InitiativeSummaryPage';
import EditInitiativePage from './pages/initiative/editInitiative/EditInitiativePage';
import CreateInitiativePage from './pages/initiative/createInitiative/CreateInitiativePage';
import BuilderPage from './pages/builder/BuilderPage';
import LandingPage from './pages/landing/LandingPage';

function PrivateRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/create-account"
        element={
          <PublicRoute>
            <CreateAccountPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <LandingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <PrivateRoute>
            <CustomersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <PrivateRoute>
            <JobsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <PrivateRoute>
            <ViewJobPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/parts"
        element={
          <PrivateRoute>
            <PartsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/initiatives"
        element={
          <PrivateRoute>
            <InitiativeSummaryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/initiatives/create"
        element={
          <PrivateRoute>
            <CreateInitiativePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/initiatives/:id"
        element={
          <PrivateRoute>
            <EditInitiativePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute requireAdmin>
            <UsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/builder"
        element={
          <PrivateRoute>
            <BuilderPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/data-stores"
        element={
          <PrivateRoute>
            <BuilderPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ReferenceValuesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ReferenceValuesProvider>
    </AuthProvider>
  );
}

export default App;
