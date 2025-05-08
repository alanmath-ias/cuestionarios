{/*
import { useQuery } from '@tanstack/react-query';
import { Header } from './header';
import { Footer } from './footer';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  createdAt: z.string().transform(str => new Date(str)),
});

type User = z.infer<typeof userSchema>;

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.status === 401) {
          return null;
        }
        const data = await res.json();
        return userSchema.parse(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        return null;
      }
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
  */}//el anterior es un layout perfecto hasta antes de las notificaciones del admin
  import { useQuery } from '@tanstack/react-query';
  import { Header } from './header';
  import { Footer } from './footer';
  import { z } from 'zod';
  import { useEffect, useState } from 'react';
  
  const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    name: z.string(),
    email: z.string().optional(),
    role: z.string().optional(),
    createdAt: z.string().transform(str => new Date(str)),
  });
  
  type User = z.infer<typeof userSchema>;
  
  interface PageLayoutProps {
    children: React.ReactNode;
  }
  
  export function PageLayout({ children }: PageLayoutProps) {
    // Fetch current user
    const { data: user } = useQuery<User | null, Error, User | null>({
      queryKey: ['/api/user'],
      queryFn: async () => {
        try {
          const res = await fetch('/api/user', { credentials: 'include' });
          if (res.status === 401) return null;
          const data = await res.json();
          const parsed = userSchema.parse(data);
          console.log("🧑‍🎓 Usuario cargado:", parsed);
          return parsed;
        } catch (err) {
          console.error('Failed to fetch user:', err);
          return null;
        }
      },
    });
  
    const [pendingCount, setPendingCount] = useState(0);
  
    useEffect(() => {
      const fetchPending = async () => {
        if (!user || user.role !== 'admin') return;
    
        try {
          const res = await fetch("/api/admin/pending-review-count", {
            credentials: "include",
          });
    
          // Log para ver la respuesta cruda
          console.log("🛠 Respuesta del servidor:", res);
    
          if (res.ok) {
            const data = await res.json();
            console.log("✅ Datos de pendiente:", data);
            setPendingCount(data.count);
          } else {
            const errorText = await res.text();
            console.error("❌ Error en la respuesta del servidor:", errorText);
          }
        } catch (err) {
          console.error("Error al obtener notificaciones pendientes:", err);
        }
      };
    
      fetchPending();
      const interval = setInterval(fetchPending, 60000); // cada 60s
      return () => clearInterval(interval);
    }, [user]);
    
  
    console.log("🧭 Renderizando layout con user:", user);
    console.log("🔍 pendingCount:", pendingCount);
  
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} pendingCount={pendingCount} />
        <main className="flex-grow container mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
      </div>
    );
  }
  