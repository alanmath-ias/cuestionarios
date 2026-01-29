import { useEffect, useState } from 'react';
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
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { User, Mail, Shield, GraduationCap, ArrowLeft, UserCircle, Pencil, Save, X, Zap, Check, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: true
  });

  useEffect(() => {
    if (!user && !isLoading && !error) {
      setLocation('/auth');
    }
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || ''
      });
    }
  }, [user, isLoading, error, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email: string }) => {
      const res = await apiRequest('PATCH', '/api/user', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Las contraseñas nuevas no coinciden");
      }
      const res = await apiRequest('PATCH', '/api/user', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      return res.json();
    },
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || ''
      });
    }
    setIsEditing(false);
  };

  const handlePasswordSubmit = () => {
    changePasswordMutation.mutate(passwordForm);
  };

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

  const isPremium = user.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto py-10 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
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
            <div className="flex gap-2">
              <Button
                className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contraseña</span>
              </Button>
              {!isEditing && (
                <Button
                  className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Editar Perfil</span>
                  <span className="sm:hidden">Editar</span>
                </Button>
              )}
            </div>
          </div>

          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden mb-8">
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
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                    <p className="text-slate-400">@{user.username}</p>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                        onClick={handleCancel}
                        disabled={updateProfileMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <Spinner className="h-4 w-4 mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre (Read-only) */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-1">Nombre Completo</p>
                      <p className="font-medium text-slate-200">{user.name}</p>
                      {isEditing && <p className="text-xs text-slate-500 mt-1">No editable</p>}
                    </div>
                  </div>

                  {/* Username (Editable) */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <UserCircle className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-1">Nombre de Usuario</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-purple-500"
                        />
                      ) : (
                        <p className="font-medium text-slate-200">{user.username}</p>
                      )}
                    </div>
                  </div>

                  {/* Email (Editable) */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                      <Mail className="h-5 w-5 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-1">Correo Electrónico</p>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-pink-500"
                          placeholder="Agrega un correo"
                        />
                      ) : (
                        <p className="font-medium text-slate-200">{user.email || 'No registrado'}</p>
                      )}
                    </div>
                  </div>

                  {/* Role (Read-only) */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
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

          {/* Subscription Status Section */}
          <Card className={`border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden ${isPremium ? 'bg-slate-900/50' : 'bg-gradient-to-br from-slate-900 to-purple-900/20'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className={`h-5 w-5 ${isPremium ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`} />
                Suscripción
              </CardTitle>
              <CardDescription className="text-slate-400">
                Estado actual de tu plan de aprendizaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {isPremium ? 'Plan Premium' : 'Plan Gratuito'}
                    </h3>
                    {isPremium && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-none">Activo</Badge>
                    )}
                  </div>
                  <p className="text-slate-200 max-w-md">
                    {isPremium
                      ? `Tu suscripción está activa hasta el ${new Date(user.subscriptionEndDate!).toLocaleDateString()}. Disfruta de acceso ilimitado.`
                      : "Estás usando la versión gratuita. Actualiza a Premium para desbloquear todo el contenido y explicaciones detalladas."}
                  </p>
                </div>

                {!isPremium && (
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 whitespace-nowrap"
                    onClick={() => setLocation('/subscription')}
                  >
                    Mejorar a Premium
                  </Button>
                )}
              </div>

              {isPremium && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-green-400" /> Acceso Ilimitado
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-green-400" /> Explicaciones IA
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-green-400" /> Soporte Prioritario
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Danger Zone */}
          {user.id !== 1 && user.id !== 2 && (
            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl shadow-2xl overflow-hidden mt-8">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription className="text-red-400/70">
                  Acciones irreversibles para tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-red-200 mb-1">Eliminar Cuenta</h3>
                    <p className="text-sm text-red-200/60 max-w-md">
                      Si eliminas tu cuenta, perderás todo tu progreso, logros y suscripciones activas. Esta acción no se puede deshacer.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40"
                    onClick={() => window.open(`https://wa.me/573208056799?text=Hola, quiero eliminar mi cuenta de AlanMath. Mi usuario es ${user.username}`, '_blank')}
                  >
                    Solicitar Eliminación
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Cambiar Contraseña</DialogTitle>
            <DialogDescription className="text-slate-400">
              Ingresa tu contraseña actual y la nueva contraseña que deseas utilizar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Contraseña Actual</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nueva Contraseña</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsPasswordDialogOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Actualizar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
