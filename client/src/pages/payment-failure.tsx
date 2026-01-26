import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function PaymentFailurePage() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl shadow-red-900/20">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Pago Pendiente o Fallido</h1>
                <p className="text-slate-400 mb-8">
                    Hubo un problema procesando tu pago o está en proceso de validación. Si crees que es un error, contáctanos.
                </p>
                <div className="space-y-3">
                    <Button
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-6"
                        onClick={() => setLocation("/subscription")}
                    >
                        Intentar de Nuevo
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-white"
                        onClick={() => setLocation("/dashboard")}
                    >
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
