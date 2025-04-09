import { useQuery } from '@tanstack/react-query';
import { Header } from './header';
import { Footer } from './footer';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  email: z.string().optional(),
  createdAt: z.string().transform(str => new Date(str)),
});

type User = z.infer<typeof userSchema>;

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state for login/register
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch current user
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiRequest('POST', '/api/auth/login', { username, password });
      await refetch();
      setUsername('');
      setPassword('');
      toast({
        title: 'Inicio de sesión correcto',
        description: '¡Bienvenido a AlanMath!',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error de inicio de sesión',
        description: 'Usuario o contraseña incorrectos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiRequest('POST', '/api/auth/register', { 
        username, 
        password,
        name,
        email 
      });
      await refetch();
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');
      toast({
        title: 'Registro exitoso',
        description: '¡Bienvenido a AlanMath!',
      });
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: 'Error de registro',
        description: 'No se pudo crear la cuenta. Intente con otro nombre de usuario.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, auto-login as student
  useEffect(() => {
    const autoLogin = async () => {
      if (!user && !isLoading && !loading) {
        try {
          await apiRequest('POST', '/api/auth/login', { 
            username: 'estudiante', 
            password: 'estudiante123' 
          });
          await refetch();
        } catch (error) {
          console.error('Auto-login error:', error);
        }
      }
    };
    
    autoLogin();
  }, [user, isLoading, refetch, loading]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {user ? (
          children
        ) : (
          <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md mx-4">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">AlanMath</h1>
                <p className="text-gray-600">Plataforma de Cuestionarios Matemáticos</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-2">
                    <Button
                      variant={showLoginForm ? "default" : "outline"}
                      onClick={() => setShowLoginForm(true)}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant={!showLoginForm ? "default" : "outline"}
                      onClick={() => setShowLoginForm(false)}
                    >
                      Registrarse
                    </Button>
                  </div>
                </div>
                
                {showLoginForm ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Usuario
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-200"
                        id="username"
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Contraseña
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-200"
                        id="password"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Nombre Completo
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-200"
                        id="name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="register-username">
                        Usuario
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-200"
                        id="register-username"
                        type="text"
                        placeholder="Elige un nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-200"
                        id="email"
                        type="email"
                        placeholder="Tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="register-password">
                        Contraseña
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-200"
                        id="register-password"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? 'Registrando...' : 'Registrarse'}
                      </Button>
                    </div>
                  </form>
                )}
                
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Credenciales de demostración:</p>
                  <p className="font-semibold">Usuario: estudiante / Contraseña: estudiante123</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
