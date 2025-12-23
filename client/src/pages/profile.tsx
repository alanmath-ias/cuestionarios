import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { User, Mail, Shield, GraduationCap, ArrowLeft, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: true
  });

  useEffect(() => {
    if (!user && !isLoading && !error) {
      setLocation('/auth');
    }
  }, [user, isLoading, error, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Spinner className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="w-full max-w-md bg-slate-900 border-white/10 text-slate-200">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-slate-400">No se pudo cargar la información del perfil.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user'] })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto py-10 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          </div>

          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/5" />
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="h-32 w-32 rounded-full bg-slate-950 p-2 border-4 border-slate-900 shadow-xl">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`
                    px-4 py-1.5 text-sm font-medium border-none
                    ${user.role === 'admin' ? 'bg-green-500/20 text-green-400' :
                      user.role === 'parent' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'}
                  `}
                >
                  {user.role === 'admin' ? 'Administrador' : user.role === 'parent' ? 'Padre' : 'Estudiante'}
                </Badge>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                  <p className="text-slate-400">@{user.username}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Nombre Completo</p>
                      <p className="font-medium text-slate-200">{user.name}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <UserCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Nombre de Usuario</p>
                      <p className="font-medium text-slate-200">{user.username}</p>
                    </div>
                  </div>

                  {user.email && (
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <Mail className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Correo Electrónico</p>
                        <p className="font-medium text-slate-200">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Rol de Cuenta</p>
                      <p className="font-medium text-slate-200 capitalize">
                        {user.role === 'admin' ? 'Administrador' : user.role === 'parent' ? 'Padre' : 'Estudiante'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-800/30 border border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Estado de la Cuenta</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {user.role === 'admin' ? (
                          "Tienes permisos de administrador total. Puedes gestionar usuarios, crear cuestionarios y supervisar toda la plataforma desde el panel de administración."
                        ) : user.role === 'parent' ? (
                          "Tu cuenta de padre te permite supervisar el progreso académico de tus hijos, ver sus calificaciones y recibir reportes de actividad."
                        ) : (
                          "Tu cuenta de estudiante está activa. Puedes acceder a todos los cursos, realizar cuestionarios, ganar logros y seguir tu progreso de aprendizaje."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
