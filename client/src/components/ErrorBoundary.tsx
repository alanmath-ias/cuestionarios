import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // También puedes enviar el error a un servicio de reporte de errores
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            // Puedes renderizar cualquier interfaz de repuesto personalizada
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900/80 border border-red-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
                        <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Tu conexión a internet es inestable</h1>
                            <p className="text-slate-400">
                                La aplicación ha detectado una interrupción en la carga de los componentes. Por favor, recarga la página para continuar con tu actividad.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Recargar y Continuar
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => window.location.href = '/'}
                                className="text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl flex items-center justify-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Regresar al Inicio
                            </Button>
                        </div>

                        <p className="text-[10px] text-slate-600 uppercase tracking-widest pt-4">
                            Sistema de Protección AlanMath v1.0
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
