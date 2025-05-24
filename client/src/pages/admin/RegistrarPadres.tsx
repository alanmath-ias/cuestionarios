import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function RegisterParentPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const [parent, setParent] = useState({ username: '', password: '', name: '', email: '' });
  const [child, setChild] = useState({ username: '', password: '', name: '', email: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('POST', '/api/auth/register-parent', { parent, child });
      toast({ title: 'Registro exitoso', description: 'Padre e hijo registrados correctamente' });
      setLocation('/');
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo registrar la cuenta.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-lg w-full max-w-xl space-y-6" onSubmit={handleRegister}>
        <h2 className="text-xl font-bold text-center">Registro de Padre e Hijo</h2>

        {/* Datos del padre */}
        <div>
          <h3 className="font-semibold mb-2">Datos del Padre</h3>
          <input type="text" placeholder="Nombre" required value={parent.name} onChange={(e) => setParent({ ...parent, name: e.target.value })} className="input" />
          <input type="text" placeholder="Usuario" required value={parent.username} onChange={(e) => setParent({ ...parent, username: e.target.value })} className="input" />
          <input type="password" placeholder="Contraseña" required value={parent.password} onChange={(e) => setParent({ ...parent, password: e.target.value })} className="input" />
          <input type="email" placeholder="Correo (opcional)" value={parent.email} onChange={(e) => setParent({ ...parent, email: e.target.value })} className="input" />
        </div>

        {/* Datos del hijo */}
        <div>
          <h3 className="font-semibold mb-2">Datos del Hijo</h3>
          <input type="text" placeholder="Nombre" required value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} className="input" />
          <input type="text" placeholder="Usuario" required value={child.username} onChange={(e) => setChild({ ...child, username: e.target.value })} className="input" />
          <input type="password" placeholder="Contraseña" required value={child.password} onChange={(e) => setChild({ ...child, password: e.target.value })} className="input" />
          <input type="email" placeholder="Correo (opcional)" value={child.email} onChange={(e) => setChild({ ...child, email: e.target.value })} className="input" />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Padre e Hijo'}
        </Button>
      </form>
    </div>
  );
}
