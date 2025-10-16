import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // ✅ new import
import Header from './components/Header';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProposeLocation from './components/ProposeLocation';
import AdminReview from './components/AdminReview';
import Admin from './pages/Admin';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/propose" element={<ProtectedRoute><ProposeLocation /></ProtectedRoute>} />

        {/* ✅ Admin-only route */}
        <Route path="/admin-review" element={<AdminRoute><AdminReview /></AdminRoute>} />

        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
