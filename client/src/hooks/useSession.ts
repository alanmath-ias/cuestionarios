import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface SessionData {
  userId?: number;
  role?: string;
  username?: string;
  hintCredits?: number;
  tourStatus?: Record<string, boolean>;
  canReport?: boolean;
  isImpersonating?: boolean;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          const userData = await response.json();
          setSession({
            userId: userData.id,
            role: userData.role,
            username: userData.username,
            hintCredits: userData.hintCredits,
            tourStatus: userData.tourStatus,
            canReport: userData.canReport,
            isImpersonating: userData.isImpersonating
          });
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return { session, loading };
}