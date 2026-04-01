import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import UploadFile from './pages/UploadFile';
import FilesList from './pages/FilesList';
import HtmlEmail from './pages/HtmlEmail';
import ImageEmail from './pages/ImageEmail';
import ZipEmail from './pages/ZipEmail';
import ScheduledCampaigns from './pages/ScheduledCampaigns';
import EmailSettings from './pages/EmailSettings';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />

            {/* Admin Only Routes */}
            <Route path="/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
            <Route path="/users/add" element={<ProtectedRoute adminOnly><AddUser /></ProtectedRoute>} />
            <Route path="/users/edit/:id" element={<ProtectedRoute adminOnly><EditUser /></ProtectedRoute>} />

            {/* Shared Routes */}
            <Route path="/upload" element={<UploadFile />} />
            <Route path="/files" element={<FilesList />} />

            <Route path="/marketing/html" element={<HtmlEmail />} />
            <Route path="/marketing/image" element={<ImageEmail />} />
            <Route path="/marketing/zip" element={<ZipEmail />} />
            <Route path="/scheduled" element={<ScheduledCampaigns />} />
            <Route path="/email-settings" element={<EmailSettings />} />

            {/* Additional routes will go here */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
