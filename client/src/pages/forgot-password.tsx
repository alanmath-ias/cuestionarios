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
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

            <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl relative z-10">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-white">Recuperar Contraseña</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        Ingresa tu nombre de usuario y correo electrónico para restablecer tu contraseña.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-4 rounded-xl">
                                <p className="font-bold">¡Solicitud enviada!</p>
                                <p className="text-sm mt-2 opacity-90">
                                    Revisa tu correo electrónico (y la carpeta de spam) para encontrar el enlace de recuperación.
                                </p>
                            </div>
                            <Link href="/auth">
                                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al inicio de sesión
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium leading-none text-slate-300">
                                    Nombre de Usuario
                                </label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Tu usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none text-slate-300">
                                    Correo Electrónico
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] border-0"
                                disabled={loading}
                            >
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
                                <Button variant="link" className="w-full text-slate-400 hover:text-white transition-colors" type="button">
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
