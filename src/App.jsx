import { HashRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProposeLocation from './components/ProposeLocation';
import AdminReview from './components/AdminReview';
import Admin from './pages/Admin';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/propose" element={<ProtectedRoute><ProposeLocation /></ProtectedRoute>} />
          <Route path="/admin/review" element={<ProtectedRoute><AdminReview /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
