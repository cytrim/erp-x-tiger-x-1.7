/*  2025 Tiger X Panel  Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import MySettings from './pages/MySettings';
import Profile from './pages/Profile';
import { useTranslation } from 'react-i18next';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:24,fontFamily:'system-ui, sans-serif'}}>
          <h2>Etwas ist schiefgelaufen</h2>
          <p>Bitte Seite neu laden (Strg+F5). Wenn das erneut passiert, schick uns die Konsole.</p>
          <pre style={{whiteSpace:'pre-wrap',background:'#f6f6f6',padding:12,borderRadius:8}}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}


function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  useTranslation(); // re-render on language change root
  return (
    <RootErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><AppLayout><Customers /></AppLayout></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><AppLayout><Products /></AppLayout></PrivateRoute>} />
      <Route path="/quotes" element={<PrivateRoute><AppLayout><Quotes /></AppLayout></PrivateRoute>} />
      <Route path="/invoices" element={<PrivateRoute><AppLayout><Invoices /></AppLayout></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute><AppLayout><Payments /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><AppLayout><MySettings /></AppLayout></PrivateRoute>} />
	  <Route path="/admin" element={<PrivateRoute><AppLayout><AdminDashboard /></AppLayout></PrivateRoute>} />
	  <Route path="/admin/users" element={<PrivateRoute><AppLayout><UserManagement /></AppLayout></PrivateRoute>} />
    </Routes>
    </RootErrorBoundary>
  );
}
