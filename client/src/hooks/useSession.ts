import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SessionData {
  userId?: number;
  role?: string;
  username?: string;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          setSession({
            userId: userData.id,
            role: userData.role,
            username: userData.username
          });
        } else {
          setSession(null);
          // Guarda la ubicación actual para redirigir después del login
          navigate('/auth/login', { 
            state: { from: location.pathname } 
          });
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  return { session, loading };
}