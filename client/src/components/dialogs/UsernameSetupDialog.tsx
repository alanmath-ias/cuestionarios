import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/types";
import { Rocket, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";

interface UsernameSetupDialogProps {
    isOpen: boolean;
    user: User | undefined;
    onSuccess?: () => void;
}

export function UsernameSetupDialog({ isOpen, user, onSuccess }: UsernameSetupDialogProps) {
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
        }
    }, [user]);

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
        if (!username.trim()) {
            toast({
                title: "Nombre requerido",
                description: "Por favor escribe un nombre de usuario.",
                variant: "destructive"
            });
            return;
        }
        updateProfileMutation.mutate(username);
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200 [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-xl">
                        <Rocket className="w-5 h-5 text-purple-500" />
                        ¡Hola {user.name.split(' ')[0]}!
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Para terminar tu registro, elige un nombre de usuario único.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
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
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
                    >
                        {updateProfileMutation.isPending ? 'Guardando...' : 'Aceptar y Continuar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
