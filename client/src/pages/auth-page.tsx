import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaWhatsapp } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  name?: string;
}

export default function AuthPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Check for mode=register in URL
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get('mode');

  const [showLoginForm, setShowLoginForm] = useState(initialMode !== 'register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user && !registrationSuccess) {
      setLocation('/');
    }
  }, [user, setLocation, registrationSuccess]);

  // Handle Google Auth errors from URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'not_found') {
      setShowNotFoundDialog(true);
      // Clean URL immediately to avoid re-triggering on refresh
      window.history.replaceState({}, '', '/auth?mode=login');
    } else if (error === 'failed') {
      toast({
        title: 'Error de autenticación',
        description: 'No se pudo iniciar sesión con Google.',
        variant: 'destructive',
      });
    }
  }, [location, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedUsername = username.toLowerCase();
      await apiRequest('POST', '/api/auth/login', {
        username: normalizedUsername,
        password
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setUsername('');
      setPassword('');
      toast({
        title: 'Inicio de sesión correcto',
        description: '¡Bienvenido a AlanMath!',
      });
      setLocation('/');
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
      const normalizedUsername = username.toLowerCase();
      await apiRequest('POST', '/api/auth/register', {
        username: normalizedUsername,
        password,
        name,
        email
      });

      setRegisteredName(name);
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');

      toast({
        title: 'Registro exitoso',
        description: '¡Bienvenido a AlanMath!',
      });

      setRegistrationSuccess(true);
      setLocation('/welcome');
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="mb-8 text-center">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al inicio</span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AlanMath
            </h1>
          </div>
          <p className="text-slate-400">Plataforma de Entrenamiento en Matemáticas</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8 bg-slate-950/50 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${showLoginForm
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
              onClick={() => setShowLoginForm(true)}
            >
              Iniciar Sesión
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!showLoginForm
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
              onClick={() => setShowLoginForm(false)}
            >
              Registrarse
            </button>
          </div>

          {showLoginForm ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="username">
                  Usuario
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  id="username"
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password">
                  Contraseña
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password">
                  <span className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
                    ¿Olvidaste tu contraseña?
                  </span>
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="name">
                  Nombre Completo
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="register-username">
                  Usuario
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  id="register-username"
                  type="text"
                  placeholder="Elige un nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="register-password">
                  Contraseña
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400">O continuar con</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 bg-white text-black hover:bg-slate-200 border-transparent font-medium"
              onClick={() => {
                const intent = showLoginForm ? 'login' : 'register';
                window.location.href = `/auth/google?intent=${intent}`;
              }}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Google
            </Button>
          </div>

          {/* Sección de ayuda */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-center">
              <a
                href="https://wa.me/573208056799?text=Hola,%20tengo%20una%20duda%20sobre%20la%20app%20alanmath"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-sm font-medium"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>¿Necesitas ayuda para ingresar?</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showNotFoundDialog} onOpenChange={setShowNotFoundDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Cuenta no encontrada</DialogTitle>
            <DialogDescription className="text-slate-300">
              No hemos encontrado una cuenta registrada con este correo de Google.
              <br /><br />
              ¿Deseas crear una nueva cuenta ahora?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNotFoundDialog(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white border-0"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowNotFoundDialog(false);
                window.location.href = '/auth/google?intent=register';
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Sí, registrarme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}