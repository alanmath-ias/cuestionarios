import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { Link } from 'wouter';

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
      console.error('Register parent-child error:', err);

      let errorMessage = 'Auch! No pudimos registrar las cuentas. Por favor, verifica los datos e intenta de nuevo.';
      const errorStr = String(err);

      if (errorStr.includes('already exists') || errorStr.includes('ya está en uso')) {
        errorMessage = 'Ups! Uno de los nombres de usuario ya existe, por favor elige otros que te gusten.';
      } else if (errorStr.includes('email') || errorStr.includes('correo') || errorStr.includes('Correo')) {
        errorMessage = 'Auch! parece que uno de los correos no quedó bien escrito, revisa el @ y el puntito';
      }

      toast({
        title: 'Error de registro',
        description: errorMessage,
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
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">Registro de Padre e Hijo</h1>
          <p className="text-slate-400">Crea cuentas vinculadas para un padre y su hijo.</p>
        </div>

        <Card className="bg-slate-900 border border-white/10 shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
              <UserPlus className="h-5 w-5 text-blue-400" />
              Formulario de Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-8">
              {/* Sección del Padre */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2 text-blue-400">Datos del Padre</h3>

                <div className="grid gap-2">
                  <Label htmlFor="parent-name" className="text-slate-400">Nombre completo</Label>
                  <Input
                    id="parent-name"
                    name="name"
                    placeholder="Ej: Juan Pérez"
                    required
                    value={parent.name}
                    onChange={handleParentChange}
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parent-username" className="text-slate-400">Nombre de usuario</Label>
                  <Input
                    id="parent-username"
                    name="username"
                    placeholder="Ej: juanperez"
                    required
                    value={parent.username}
                    onChange={handleParentChange}
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parent-password" className="text-slate-400">Contraseña</Label>
                  <Input
                    id="parent-password"
                    name="password"
                    type="password"
                    required
                    value={parent.password}
                    onChange={handleParentChange}
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parent-email" className="text-slate-400">Correo electrónico</Label>
                  <Input
                    id="parent-email"
                    name="email"
                    type="email"
                    placeholder="Ej: juan@ejemplo.com"
                    value={parent.email}
                    onChange={handleParentChange}
                    required
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* Sección del Hijo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-white/10 pb-2 text-green-400">Datos del Hijo</h3>

                <div className="grid gap-2">
                  <Label htmlFor="child-name" className="text-slate-400">Nombre completo</Label>
                  <Input
                    id="child-name"
                    name="name"
                    placeholder="Ej: Ana Pérez"
                    required
                    value={child.name}
                    onChange={handleChildChange}
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-green-500/50 placeholder:text-slate-600 focus:border-green-500/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="child-username" className="text-slate-400">Nombre de usuario</Label>
                  <Input
                    id="child-username"
                    name="username"
                    placeholder="Ej: anaperez"
                    required
                    value={child.username}
                    onChange={handleChildChange}
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-green-500/50 placeholder:text-slate-600 focus:border-green-500/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="child-password" className="text-slate-400">Contraseña</Label>
                  <Input
                    id="child-password"
                    name="password"
                    type="password"
                    required
                    value={child.password}
                    onChange={handleChildChange}
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-green-500/50 placeholder:text-slate-600 focus:border-green-500/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="child-email" className="text-slate-400">Correo electrónico</Label>
                  <Input
                    id="child-email"
                    name="email"
                    type="email"
                    placeholder="Ej: ana@ejemplo.com"
                    value={child.email}
                    onChange={handleChildChange}
                    required
                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-green-500/50 placeholder:text-slate-600 focus:border-green-500/50"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 py-6 text-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Padre e Hijo'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}