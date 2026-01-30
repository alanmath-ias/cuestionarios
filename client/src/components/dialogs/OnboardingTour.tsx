import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Video, GraduationCap, ArrowRight, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@/types/types";

interface OnboardingTourProps {
    isOpen: boolean;
    user: User;
    onComplete: () => void;
}

export function OnboardingTour({ isOpen, user, onComplete }: OnboardingTourProps) {
    const [step, setStep] = useState(0);
    const queryClient = useQueryClient();

    const updateTourStatusMutation = useMutation({
        mutationFn: async () => {
            // Merge existing tour status with new onboarding flag
            const currentStatus = user.tourStatus || {};
            const newStatus = { ...currentStatus, onboarding: true };
            await apiRequest('PATCH', '/api/user', { tourStatus: newStatus });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            queryClient.invalidateQueries({ queryKey: ['current-user'] });

            // Persist to localStorage to prevent immediate reappearance
            localStorage.setItem(`onboardingTour_${user.id}`, 'true');

            onComplete();
        }
    });

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            updateTourStatusMutation.mutate();
        }
    };

    const slides = [
        {
            icon: <Star className="w-12 h-12 text-yellow-400" />,
            title: "Potencia tu Aprendizaje",
            description: "Bienvenido a la experiencia premium de AlanMath. Aquí tienes todo para destacar:",
            content: (
                <div className="space-y-3 mt-4">
                    {[
                        "Cuestionarios tipo examen de U. y Colegio",
                        "Calificación inmediata y precisa",
                        "Explicación paso a paso de errores",
                        "Crea cuestionarios a tu medida",
                        "Pistas inteligentes cuando te atasques"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="bg-green-500/20 p-1 rounded-full">
                                <Check className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="text-sm text-slate-200">{item}</span>
                        </div>
                    ))}
                </div>
            )
        },
        {
            icon: <GraduationCap className="w-12 h-12 text-blue-400" />,
            title: "¿Necesitas más ayuda?",
            description: "A veces todos necesitamos un empujón extra.",
            content: (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-900/40 to-slate-900/60 border border-blue-500/30 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <h4 className="text-lg font-bold text-blue-200 mb-2">Clases Personalizadas</h4>
                    <p className="text-sm text-slate-400 mb-4">
                        Si algún tema se te resiste, no te quedes con la duda.
                        <strong className="text-green-400"> Usa el botón de WhatsApp (↘)</strong> que ves en la esquina. Nuestros expertos están a un chat de distancia.
                    </p>

                    <div className="bg-blue-600/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full inline-block">
                        Agenda tu refuerzo en segundos
                    </div>
                </div>
            )
        },
        {
            icon: <Video className="w-12 h-12 text-purple-400" />,
            title: "Videoteca Exclusiva",
            description: "Un regalo especial para nuestra comunidad.",
            content: (
                <div className="mt-6 text-center">
                    <div className="w-full aspect-video bg-slate-950 rounded-xl border border-white/10 flex items-center justify-center mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                            alt="Video thumbnail"
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <div className="z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                        </div>
                    </div>

                    <p className="text-sm text-slate-300">
                        Estamos actualizando constantemente nuestra videoteca para que comprendas cada tema a profundidad.
                        No solo practicas, <span className="text-purple-400 font-bold">estudias con AlanMath</span>.
                    </p>
                </div>
            )
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-slate-950/95 backdrop-blur-xl border-white/10 text-white p-0 gap-0 overflow-hidden shadow-2xl shadow-blue-900/20 [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <div className="absolute top-0 w-full h-1 bg-slate-800">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / slides.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="p-6 pt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-[300px] flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 shadow-lg">
                                    {slides[step].icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">{slides[step].title}</h2>
                                    <p className="text-xs text-slate-400">Paso {step + 1} de {slides.length}</p>
                                </div>
                            </div>

                            <p className="text-slate-300 text-sm">{slides[step].description}</p>

                            <div className="flex-1">
                                {slides[step].content}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="p-4 bg-slate-900 border-t border-white/5 flex justify-between items-center">
                    <div className="flex gap-1">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-blue-500 w-4' : 'bg-slate-700'}`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleNext}
                        className="bg-white text-slate-950 hover:bg-slate-200 font-bold transition-all"
                        disabled={updateTourStatusMutation.isPending}
                    >
                        {updateTourStatusMutation.isPending ? (
                            <span className="animate-pulse">Guardando...</span>
                        ) : (
                            <>
                                {step === slides.length - 1 ? "¡Comenzar Aventura!" : "Siguiente"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
