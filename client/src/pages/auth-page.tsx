import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  LineChart, 
  ListChecks, 
  Video, 
  Rocket, 
  Award,
  BrainCircuit,
  Youtube,
  Instagram,
  Facebook,
  Globe
} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
}

export default function AuthPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

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
      setShouldShowWelcome(true);
      
      // Invalidamos la query pero no esperamos por ella
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

  if (shouldShowWelcome) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">¡Bienvenid@ a AlanMath!</h1>
            <h2 className="text-2xl font-semibold">Hola {registeredName}</h2>
          </div>
          
          <div className="space-y-6 text-lg">
            <div className="flex items-start gap-4">
              <BookOpen className="flex-shrink-0 mt-1 text-blue-500" size={24} />
              <p>
                Aquí encontrarás Cuestionarios tipo Evaluación con los cuales podrás prepararte para tus exámenes de Matemáticas, Física y otras Áreas tanto del Colegio como de la Universidad.
              </p>
            </div>
            
            <div className="flex items-start gap-4">
              <LineChart className="flex-shrink-0 mt-1 text-green-500" size={24} />
              <p>
                Además, si estás estudiando con AlanMath podrás ver el progreso de tus Cursos y las Actividades que te son asignadas para que pasito a pasito seas cada día mejor con estas hermosas Ciencias.
              </p>
            </div>
            
            <div className="flex items-start gap-4">
              <ListChecks className="flex-shrink-0 mt-1 text-purple-500" size={24} />
              <p>
                Los Cuestionarios están organizados por Materias y tienes la posibilidad de ir a la sección de Entrenamiento, en donde encontrarás Cuestionarios con preguntas variadas de toda una Materia o de todo un Tema en particular que estés estudiando.
              </p>
            </div>
            
            <div className="flex items-start gap-4">
              <Video className="flex-shrink-0 mt-1 text-red-500" size={24} />
              <p>
                Contarás también con los enlaces a los videos de AlanMath tanto para las materias completas, como para los temas en particular.
              </p>
            </div>
            
            <div className="flex items-start gap-4">
              <BrainCircuit className="flex-shrink-0 mt-1 text-yellow-500" size={24} />
              <p className="font-semibold">
                Diviértete aprendiendo y no olvides que... 
                <br />
                <span className="text-primary flex items-center gap-2 mt-2">
                  <Award className="inline" /> Si Yo lo puedo hacer, Tú también lo puedes hacer!
                </span>
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => {
                setShouldShowWelcome(false);
                setLocation('/');
              }}
            >
              <Rocket size={20} />
              ¡Comencemos!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">AlanMath</h1>
          <p className="text-gray-600">Plataforma de Entrenamiento en Matemáticas</p>
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

          {/* Sección de redes sociales */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-center space-x-6">
              <a 
                href="https://youtube.com/alanmath" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500"
              >
                <Youtube className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com/alanmath" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-600"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://facebook.com/alanmath" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://tiktok.com/@alanmath" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black"
              >
                <FaTiktok className="h-6 w-6" />
              </a>
              <a 
                href="https://alanmath.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary"
              >
                <Globe className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}