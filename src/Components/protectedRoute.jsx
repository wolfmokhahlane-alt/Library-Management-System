import { Navigate } from 'react-router-dom';
import { useLibrary } from '../context/libraryContext';


export default function ProtectedRoute({ children }) {
  const { currentUser } = useLibrary();
  return currentUser ? children : <Navigate to="/login" />;
}