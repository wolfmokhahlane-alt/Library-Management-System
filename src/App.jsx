import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LibraryProvider } from './context/libraryContext';
import ProtectedRoute from './components/protectedRoute';
import Navbar from './components/navbar';
import Dashboard from './pages/dashboard';
import Books from './pages/books';
import Transactions from './pages/transactions';
import Users from './pages/users';
import Login from './pages/login';
import './App.css';

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <AppRoutes />
      </LibraryProvider>
    </BrowserRouter>
  );
}