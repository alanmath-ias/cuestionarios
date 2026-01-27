import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, HelpCircle, Gamepad2, BrainCircuit, CreditCard } from 'lucide-react';
import { RestZoneDialog } from '@/components/dialogs/RestZoneDialog';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { startTour } from '@/lib/tour';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
}

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [showRestZone, setShowRestZone] = useState(false);
  const [ageModalOpen, setAgeModalOpen] = useState(false);

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  //chat gpt cierra sesion completamente
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});

      // Limpia toda la caché de React Query
      queryClient.clear();
      sessionStorage.removeItem('welcomeShown'); // Reset welcome dialog for next login

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });

      // Redirige al login
      setLocation('/auth');
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión.",
        variant: "destructive",
      });
    }
  };
  // fin chat gpt cierra sesion completamente

  const handleDiagnosticClick = () => {
    // Limpiar datos existentes antes de abrir el modal
    localStorage.removeItem('surveyFormData');
    localStorage.removeItem('completedTests');
    sessionStorage.removeItem('quizResult');
    sessionStorage.removeItem('welcomeShown'); // Reset welcome dialog for next login

    setAgeModalOpen(true);
    setOpen(false); // Close dropdown
  };

  const handleAgeSelection = (isUnder12: boolean) => {
    setAgeModalOpen(false);
    // Navegar a EncuestaPage con parámetros de edad y reset
    setLocation(`/encuestapage?ageGroup=${isUnder12 ? 'child' : 'teen'}&reset=true`);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
            <span className="hidden md:block">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
              <span>{getInitials(user.name)}</span>
            </div>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-slate-950 border-white/10 text-slate-200">
          <DropdownMenuItem onClick={() => setLocation('/profile')}>
            Mi Perfil
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDiagnosticClick}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            <span>Diagnóstico IA</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setLocation('/subscription')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Suscripción</span>
          </DropdownMenuItem>

          {user.role === 'admin' ? (
            <DropdownMenuItem onClick={() => setLocation('/free-quizzes')}>
              Quizzes Gratuitos
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setLocation('/admin/AdminDashboard')}>
                Dashboard
              </DropdownMenuItem>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/admin/categories')}>
                Gestionar Materias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/admin/subcategories')}>
                Gestionar Temas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/admin/RegistrarPadres')}>
                Registrar Padres
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/admin/reports')}>
                Reportes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/admin/send-email')}>
                Enviar Correos
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowRestZone(true)}>
            <Gamepad2 className="mr-2 h-4 w-4" />
            <span>Zona de Descanso</span>
          </DropdownMenuItem>
          {user.role !== 'admin' && (
            <DropdownMenuItem onClick={() => startTour(location)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Ayuda / Tour</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RestZoneDialog open={showRestZone} onOpenChange={setShowRestZone} />

      <Dialog open={ageModalOpen} onOpenChange={setAgeModalOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-400" />
              Selecciona tu grupo de edad
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={() => handleAgeSelection(true)}
              className="h-24 flex flex-col gap-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-200 hover:text-white transition-all"
            >
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Gamepad2 className="h-5 w-5 text-blue-400" />
              </div>
              <span className="font-bold">Niño</span>
              <span className="text-xs text-blue-300/70">7 a 11 años</span>
            </Button>
            <Button
              onClick={() => handleAgeSelection(false)}
              className="h-24 flex flex-col gap-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-200 hover:text-white transition-all"
            >
              <div className="p-2 bg-purple-500/20 rounded-full">
                <BrainCircuit className="h-5 w-5 text-purple-400" />
              </div>
              <span className="font-bold">Adolescente</span>
              <span className="text-xs text-purple-300/70">12 a 16 años</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
