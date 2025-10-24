import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import PrivateRoute from '@/components/PrivateRoute';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import AuditRunner from '@/pages/AuditRunner';
import CompletedAudits from '@/pages/CompletedAudits';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/audit/new" element={<AuditRunner />} />
              <Route path="/audit/:id" element={<AuditRunner />} />
              <Route path="/completed" element={<CompletedAudits />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
