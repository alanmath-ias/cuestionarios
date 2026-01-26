import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccessPage() {
    const [, setLocation] = useLocation();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get payment_id from URL query params
                const params = new URLSearchParams(window.location.search);
                const paymentId = params.get('payment_id');
                const paymentStatus = params.get('status');

                if (paymentStatus === 'approved' && paymentId) {
                    // Call backend to verify and update DB
                    await apiRequest('POST', '/api/verify-payment', { paymentId });
                    setStatus('success');
                } else if (paymentStatus === 'approved') {
                    // Fallback if payment_id is missing but status is approved (unlikely)
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error("Verification failed:", error);
                // Even if verification fails (e.g. network), if the URL says approved, we might show success 
                // but warn the user or just show error. Let's show success if we can't verify but URL is approved?
                // No, safer to show error or ask to contact support.
                setStatus('error');
            }
        };

        verifyPayment();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl text-white font-bold">Verificando tu pago...</h2>
                    <p className="text-slate-400">Por favor espera un momento.</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl shadow-red-900/20">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Algo salió mal</h1>
                    <p className="text-slate-400 mb-8">
                        No pudimos verificar tu pago automáticamente. Si se descontó el dinero, por favor contáctanos.
                    </p>
                    <Button
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-6"
                        onClick={() => setLocation("/dashboard")}
                    >
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-green-500/20 rounded-2xl p-8 text-center shadow-2xl shadow-green-900/20">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h1>
                <p className="text-slate-400 mb-8">
                    Tu suscripción ha sido activada correctamente. Ahora tienes acceso ilimitado a todo el contenido premium.
                </p>
                <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                    onClick={() => setLocation("/dashboard")}
                >
                    Ir al Dashboard
                </Button>
            </div>
        </div>
    );
}
