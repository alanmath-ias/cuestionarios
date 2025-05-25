import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RegisterParentPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Estado inicial para reutilizar
  const initialParentState = { username: '', password: '', name: '', email: '' };
  const initialChildState = { username: '', password: '', name: '', email: '' };

  const [parent, setParent] = useState(initialParentState);
  const [child, setChild] = useState(initialChildState);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Normalizar usernames a minúsculas antes de enviar
      const payload = {
        parent: {
          ...parent,
          username: parent.username.toLowerCase(),
          email: parent.email.toLowerCase()
        },
        child: {
          ...child,
          username: child.username.toLowerCase(),
          email: child.email.toLowerCase()
        }
      };

      await apiRequest('POST', '/api/auth/register-parent', payload);
      toast({ 
        title: 'Registro exitoso', 
        description: 'Padre e hijo registrados correctamente',
        duration: 3000
      });
      
      // Reiniciar los formularios
      setParent(initialParentState);
      setChild(initialChildState);
      
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: 'No se pudo registrar la cuenta.', 
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParent(prev => ({ ...prev, [name]: value }));
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChild(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Registro de Padre e Hijo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Sección del Padre */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Datos del Padre</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="parent-name">Nombre completo</Label>
                <Input
                  id="parent-name"
                  name="name"
                  placeholder="Ej: Juan Pérez"
                  required
                  value={parent.name}
                  onChange={handleParentChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="parent-username">Nombre de usuario</Label>
                <Input
                  id="parent-username"
                  name="username"
                  placeholder="Ej: juanperez"
                  required
                  value={parent.username}
                  onChange={handleParentChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="parent-password">Contraseña</Label>
                <Input
                  id="parent-password"
                  name="password"
                  type="password"
                  required
                  value={parent.password}
                  onChange={handleParentChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="parent-email">Correo electrónico <span className="text-sm text-gray-500">(opcional)</span></Label>
                <Input
                  id="parent-email"
                  name="email"
                  type="email"
                  placeholder="Ej: juan@ejemplo.com"
                  value={parent.email}
                  onChange={handleParentChange}
                />
              </div>
            </div>

            {/* Sección del Hijo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Datos del Hijo</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="child-name">Nombre completo</Label>
                <Input
                  id="child-name"
                  name="name"
                  placeholder="Ej: Ana Pérez"
                  required
                  value={child.name}
                  onChange={handleChildChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="child-username">Nombre de usuario</Label>
                <Input
                  id="child-username"
                  name="username"
                  placeholder="Ej: anaperez"
                  required
                  value={child.username}
                  onChange={handleChildChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="child-password">Contraseña</Label>
                <Input
                  id="child-password"
                  name="password"
                  type="password"
                  required
                  value={child.password}
                  onChange={handleChildChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="child-email">Correo electrónico <span className="text-sm text-gray-500">(opcional)</span></Label>
                <Input
                  id="child-email"
                  name="email"
                  type="email"
                  placeholder="Ej: ana@ejemplo.com"
                  value={child.email}
                  onChange={handleChildChange}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Padre e Hijo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}