import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession'; // Asegúrate de tener este hook

interface AdminProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

const AdminProtectedRoute = ({ component: Component, path }: AdminProtectedRouteProps) => {
  const navigate = useNavigate();
  const { session, loading } = useSession(); // Hook que verifica la sesión

  useEffect(() => {
    if (!loading && (!session || session.role !== 'admin')) {
      // Redirige a login si no está autenticado o no es admin
      navigate('/auth/login', { state: { from: path } });
    }
  }, [session, loading, navigate, path]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div>Cargando verificación de permisos...</div>
    </div>;
  }

  if (!session || session.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen">
      <div>No tienes permisos para acceder a esta página</div>
    </div>;
  }

  return <Component />;
};

export default AdminProtectedRoute;