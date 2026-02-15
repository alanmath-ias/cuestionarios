import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/types";
import { Rocket, User as UserIcon, Users, ArrowLeft, Heart } from "lucide-react";
import { useLocation } from "wouter";

interface UsernameSetupDialogProps {
    isOpen: boolean;
    user: User | undefined;
    onSuccess?: () => void;
}

export function UsernameSetupDialog({ isOpen, user, onSuccess }: UsernameSetupDialogProps) {
    const [isParentMode, setIsParentMode] = useState(false);
    const [parentName, setParentName] = useState(user?.name || "");
    const [childName, setChildName] = useState("");
    const [username, setUsername] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [_, setLocation] = useLocation();

    // Pre-fill with Google name or default
    useEffect(() => {
        if (user?.name) {
            // Simple sanitization to make it a valid username candidate (lowercase, no spaces)
            const suggested = user.name.toLowerCase().replace(/\s+/g, '');
            setUsername(suggested);
            setParentName(user.name);
        }
    }, [user]);

    const requestParentRegistrationMutation = useMutation({
        mutationFn: async (data: { parentName: string, childName: string, username: string }) => {
            await apiRequest('POST', '/api/parent/request-registration', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            toast({
                title: "¡Solicitud Recibida!",
                description: "Hemos notificado al administrador para que vincule tu cuenta con la de tu hijo.",
                className: "bg-indigo-600 text-white border-none"
            });
            // Redirect to home which will handle the role routing
            setLocation('/');
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "No se pudo procesar tu solicitud. Intenta de nuevo.",
                variant: "destructive"
            });
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (newUsername: string) => {
            await apiRequest('PATCH', '/api/user', { username: newUsername });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            toast({
                title: "¡Bienvenido!",
                description: "Tu nombre de usuario ha sido actualizado.",
                className: "bg-green-600 text-white border-none"
            });
            if (onSuccess) {
                onSuccess();
            } else {
                setLocation('/');
            }
        },
        onError: (error: any) => {
            toast({
                title: "Nombre no disponible",
                description: error.message || "Ese nombre de usuario ya existe. Por favor elige otro.",
                variant: "destructive"
            });
        }
    });

    const handleSubmit = () => {
        if (isParentMode) {
            if (!parentName.trim() || !childName.trim() || !username.trim()) {
                toast({
                    title: "Campos requeridos",
                    description: "Por favor escribe tu nombre, un nombre de usuario y el de tu hijo.",
                    variant: "destructive"
                });
                return;
            }
            requestParentRegistrationMutation.mutate({ parentName, childName, username });
        } else {
            if (!username.trim()) {
                toast({
                    title: "Nombre requerido",
                    description: "Por favor elige un nombre de usuario.",
                    variant: "destructive"
                });
                return;
            }
            updateProfileMutation.mutate(username);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200 [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-xl">
                        {isParentMode ? (
                            <>
                                <Users className="w-5 h-5 text-indigo-400" />
                                Registro para Padres
                            </>
                        ) : (
                            <>
                                <Rocket className="w-5 h-5 text-purple-500" />
                                ¡Hola {user.name.split(' ')[0]}!
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {isParentMode
                            ? "Completa tus datos para que podamos vincularte con el progreso de tu hijo."
                            : "Para terminar tu registro, elige un nombre de usuario único."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isParentMode ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-indigo-400" />
                                    Tu nombre completo
                                </label>
                                <Input
                                    value={parentName}
                                    onChange={(e) => setParentName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="bg-slate-950 border-slate-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-blue-400" />
                                    Tu nombre de usuario
                                </label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ej: juanperez2024"
                                    className="bg-slate-950 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                                />
                                <p className="text-xs text-slate-500">
                                    Este será tu identificador único en la plataforma.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-rose-400" />
                                    Nombre de tu hijo/a
                                </label>
                                <Input
                                    value={childName}
                                    onChange={(e) => setChildName(e.target.value)}
                                    placeholder="Ej: Anita Pérez"
                                    className="bg-slate-950 border-slate-700 text-white focus:ring-rose-500 focus:border-rose-500"
                                />
                                <p className="text-xs text-slate-500">
                                    Usaremos este nombre para encontrar y vincular su cuenta.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-blue-400" />
                                Tu nombre de usuario
                            </label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ej: juanperez2024"
                                className="bg-slate-950 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                            />
                            <p className="text-xs text-slate-500">
                                Este será tu identificador único en la plataforma.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isPending || requestParentRegistrationMutation.isPending}
                        className={`w-full font-bold text-white ${isParentMode
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            }`}
                    >
                        {updateProfileMutation.isPending || requestParentRegistrationMutation.isPending
                            ? 'Procesando...'
                            : (isParentMode ? 'Solicitar Registro' : 'Aceptar y Continuar')}
                    </Button>

                    {!isParentMode ? (
                        <button
                            onClick={() => setIsParentMode(true)}
                            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 group"
                        >
                            <Users className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            ¿Eres padre de familia? Regístrate aquí
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsParentMode(false)}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Volver al registro de estudiante
                        </button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
