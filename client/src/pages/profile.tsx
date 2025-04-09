import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

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
  const [isUpdating, setIsUpdating] = useState(false);

  // Obtener los datos del usuario
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    enabled: true
  });

  useEffect(() => {
    if (!user && !isLoading && !error) {
      setLocation('/auth');
    }
  }, [user, isLoading, error, setLocation]);

  const makeAdmin = async () => {
    setIsUpdating(true);
    try {
      const response = await apiRequest('POST', '/api/auth/make-admin');
      const data = await response.json();
      
      // Invalidar consultas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: 'Rol actualizado',
        description: data.message || 'Ahora tienes permisos de administrador.',
      });
    } catch (error) {
      console.error('Error al actualizar el rol:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudo cargar la información del perfil.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] })}>
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
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Información de tu cuenta</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
              <p className="text-lg">{user.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Usuario</h3>
              <p className="text-lg">{user.username}</p>
            </div>
            
            {user.email && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-lg">{user.email}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Rol</h3>
              <p className="text-lg flex items-center">
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Administrador
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Estudiante
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {!user.role || user.role !== 'admin' ? (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Actualizar a administrador</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Convertirte en administrador te permitirá crear y gestionar categorías, quizzes y preguntas.
              </p>
              <Button 
                onClick={makeAdmin} 
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? <Spinner className="mr-2" size={16} /> : null}
                Hacerme administrador
              </Button>
            </div>
          ) : (
            <div className="mt-6 border rounded-lg p-4 bg-green-50">
              <h3 className="font-medium mb-2 text-green-700">Privilegios de administrador</h3>
              <p className="text-sm text-green-600">
                Ya tienes permisos de administrador. Puedes gestionar el contenido desde las secciones administrativas.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => setLocation('/')}>
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}