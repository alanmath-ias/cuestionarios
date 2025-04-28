import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
//import { useNavigate } from "wouter";


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
  const [_, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
/*
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      
      // Invalidar la consulta de usuario para limpiar el estado
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.'
      });
      
      // Redirigir a la página de inicio o login sin recargar
      setLocation('/auth');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión.',
        variant: 'destructive'
      });
    }
  };
*/

//chat gpt cierra sesion completamente
const handleLogout = async () => {
  try {
    await apiRequest("POST", "/api/auth/logout", {});

    // Limpia toda la caché de React Query
    queryClient.clear();

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

  return (
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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setLocation('/profile')}>
          Mi Perfil
        </DropdownMenuItem>
        
        {user.role === 'admin' ? (
          <DropdownMenuItem onClick={() => setLocation('/free-quizzes')}>
            Quizzes Gratuitos
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => setLocation('/')}>
              Mis Calificaciones
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/free-quizzes')}>
              Quizzes Gratuitos
            </DropdownMenuItem>
          </>
        )}
        
        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation('/admin')}>
              Panel Administrativo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('@pages/dashboard')}>
              Gestionar Categorías
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/admin/quizzes')}>
              Gestionar Cuestionarios
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation('/admin/urlusercategories')}>
              Gestionar Usuarios
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
