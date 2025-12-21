import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest('POST', '/api/auth/forgot-password', { email, username });
            setSubmitted(true);
            toast({
                title: 'Solicitud enviada',
                description: 'Si los datos son correctos, recibirás un enlace para restablecer tu contraseña.',
            });
        } catch (error: any) {
            console.error('Forgot password error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Hubo un problema al procesar tu solicitud.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-primary">Recuperar Contraseña</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tu nombre de usuario y correo electrónico para restablecer tu contraseña.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 text-green-700 p-4 rounded-md">
                                <p>¡Solicitud enviada!</p>
                                <p className="text-sm mt-2">
                                    Revisa tu correo electrónico (y la carpeta de spam) para encontrar el enlace de recuperación.
                                </p>
                            </div>
                            <Link href="/auth">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nombre de Usuario
                                </label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Tu usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Correo Electrónico
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar enlace de recuperación'
                                )}
                            </Button>
                            <Link href="/auth">
                                <Button variant="link" className="w-full" type="button">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
