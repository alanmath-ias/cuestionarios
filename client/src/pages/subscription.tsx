import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Star, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { data: user, isLoading: isUserLoading } = useQuery<any>({
        queryKey: ["/api/me"],
    });

    const createPreferenceMutation = useMutation({
        mutationFn: async (plan: { name: string; price: number }) => {
            const res = await apiRequest("POST", "/api/create-preference", {
                planName: plan.name,
                price: plan.price,
            });
            return res.json();
        },
        onSuccess: (data) => {
            if (data.id) {
                const url = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${data.id}`;
                window.open(url, '_blank');
                setLoading(false); // Stop loading since we opened a new tab
            }
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo iniciar el pago. Inténtalo de nuevo.",
                variant: "destructive",
            });
        },
    });

    const handleSubscribe = (planName: string, price: number) => {
        setLoading(true);
        createPreferenceMutation.mutate({ name: planName, price });
    };

    if (isUserLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Cargando información de suscripción...</p>
                </div>
            </div>
        );
    }

    if (user?.subscriptionStatus === 'active') {
        return (
            <div className="min-h-screen bg-slate-950 py-20 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-slate-900 border border-purple-500/50 rounded-2xl p-8 text-center shadow-2xl shadow-purple-900/20">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">¡Eres Premium!</h1>
                    <p className="text-slate-400 mb-6">
                        Tu suscripción <strong>{user.subscriptionPlan}</strong> está activa hasta el {new Date(user.subscriptionEndDate).toLocaleDateString()}.
                    </p>
                    <div className="space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg text-left">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" /> Beneficios Activos
                            </h3>
                            <ul className="text-sm text-slate-400 space-y-1 ml-6 list-disc">
                                <li>Acceso ilimitado a cuestionarios</li>
                                <li>Explicaciones detalladas con IA</li>
                                <li>Soporte prioritario</li>
                            </ul>
                        </div>
                        <Button
                            className="w-full bg-slate-700 hover:bg-slate-600"
                            onClick={() => window.location.href = "/dashboard"}
                        >
                            Ir al Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Mejora tu Aprendizaje
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Desbloquea todo el potencial de AlanMath con nuestra suscripción premium. Acceso ilimitado a cuestionarios, explicaciones detalladas y seguimiento avanzado.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <Card className="bg-slate-900/50 border-slate-800 text-slate-200 relative overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white">Gratis</CardTitle>
                            <CardDescription className="text-slate-400">Para empezar a practicar</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">$0</span>
                                <span className="text-slate-500">/mes</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Acceso limitado a cuestionarios</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>50 créditos de pistas iniciales</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Explicaciones limitadas con IA</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Seguimiento básico</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-not-allowed opacity-100" disabled>
                                Plan Actual
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Premium Plan - Featured */}
                    <Card className="bg-slate-900 border-purple-500/50 text-slate-200 relative transform md:-translate-y-4 shadow-2xl shadow-purple-900/20">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            RECOMENDADO
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                Premium <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            </CardTitle>
                            <CardDescription className="text-purple-200/70">La mejor experiencia</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">$3.9</span>
                                <span className="text-slate-500"> USD/mes</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-purple-400" />
                                    <span>Acceso ilimitado a todo</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-purple-400" />
                                    <span>Explicaciones detalladas e ilimitadas con IA</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-purple-400" />
                                    <span>120 créditos de pistas iniciales</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-purple-400" />
                                    <span>Soporte prioritario</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6"
                                onClick={() => handleSubscribe("Premium Mensual", 16500)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Procesando...
                                    </div>
                                ) : "Suscribirse Ahora"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Annual Plan */}
                    <Card className="bg-slate-900/50 border-slate-800 text-slate-200">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-white">Anual</CardTitle>
                            <CardDescription className="text-slate-400">Ahorra 2 meses</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">$39</span>
                                <span className="text-slate-500"> USD/año</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-blue-500" />
                                    <span>Todos los beneficios Premium</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-blue-500" />
                                    <span>2 meses gratis</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-blue-500" />
                                    <span>Acceso anticipado a novedades</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="secondary"
                                className="w-full hover:bg-slate-800"
                                onClick={() => handleSubscribe("Premium Anual", 165000)}
                                disabled={loading}
                            >
                                {loading ? "Procesando..." : "Elegir Anual"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">Preguntas Frecuentes</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                        <div className="bg-slate-900/30 p-6 rounded-xl border border-white/5">
                            <h3 className="font-bold text-lg text-slate-200 mb-2">¿Puedo cancelar en cualquier momento?</h3>
                            <p className="text-slate-400">Sí, puedes cancelar tu suscripción cuando quieras desde tu perfil. Mantendrás el acceso hasta el final del periodo pagado.</p>
                        </div>
                        <div className="bg-slate-900/30 p-6 rounded-xl border border-white/5">
                            <h3 className="font-bold text-lg text-slate-200 mb-2">¿Qué métodos de pago aceptan?</h3>
                            <p className="text-slate-400">Aceptamos tarjetas de crédito, débito, PSE y efectivo a través de Mercado Pago, la plataforma más segura de Latam.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
