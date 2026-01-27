import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { UserQuiz } from "@/types/types";

interface WelcomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    lastActivity: UserQuiz | null;
}

export function WelcomeDialog({ open, onOpenChange, username, lastActivity }: WelcomeDialogProps) {
    const [_, setLocation] = useLocation();

    if (!lastActivity) return null;

    const isCompleted = lastActivity.status === 'completed';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-slate-200 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        {isCompleted ? (
                            <>
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                ¡Bienvenido de nuevo!
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-6 w-6 text-blue-400" />
                                ¡Hola, {username}!
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-base pt-2">
                        {isCompleted ? (
                            <span>
                                ¡Increíble trabajo completando <strong>{lastActivity.title}</strong> la última vez!
                                <br />
                                ¿Listo para un nuevo desafío hoy?
                            </span>
                        ) : (
                            <span>
                                Vimos que empezaste <strong>{lastActivity.title}</strong>.
                                <br />
                                ¿Te gustaría continuar donde lo dejaste?
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    >
                        {isCompleted ? "Cerrar" : "Más tarde"}
                    </Button>

                    {isCompleted ? (
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                            Explorar Cuestionarios
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                onOpenChange(false);
                                setLocation(`/quiz/${lastActivity.id}`);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Continuar <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
