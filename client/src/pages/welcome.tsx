import { Button } from '@/components/ui/button';
import { Rocket, BookOpen, Award, BrainCircuit } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
    id: number;
    name: string;
    username: string;
}

export default function WelcomePage() {
    const [_, setLocation] = useLocation();
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [needsUsername, setNeedsUsername] = useState(false);

    const { data: user } = useQuery<User>({
        queryKey: ['/api/user'],
        retry: false,
    });
    useEffect(() => {
        if (user) {
            const isGoogleTempUser = user.username.startsWith('google_');

            if (isGoogleTempUser) {
                setNeedsUsername(true);
                setUsername('');
            } else {
                setLocation('/');
            }
        }
    }, [user, setLocation]);

    const updateProfileMutation = useMutation({
        mutationFn: async (newUsername: string) => {
            await apiRequest('PATCH', '/api/user', { username: newUsername });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            setLocation('/');
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el nombre de usuario",
                variant: "destructive"
            });
        }
    });

    const handleStart = () => {
        if (needsUsername) {
            if (!username.trim()) {
                toast({
                    title: "Nombre de usuario requerido",
                    description: "Por favor elige un nombre de usuario para continuar.",
                    variant: "destructive"
                });
                return;
            }
            updateProfileMutation.mutate(username);
        } else {
            setLocation('/');
        }
    };

    const bannerUrl = "https://imagenes.alanmath.com/nueva-actividad.jpg";

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src={bannerUrl} alt="Bienvenido a AlanMath" className="max-w-[200px] h-auto rounded-lg shadow-sm" />
                    </div>
                    <h1 className="text-4xl font-bold text-primary mb-2">¡Bienvenid@ a AlanMath!</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Hola {user?.name || user?.username || 'Estudiante'}
                    </h2>
                    {needsUsername && (
                        <p className="text-gray-500 mt-2">¿Qué nombre de usuario quieres usar?</p>
                    )}
                </div>

                <div className="space-y-6 text-lg">
                    {needsUsername && (
                        <div className="flex justify-center">
                            <div className="w-full max-w-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Elige un nombre de usuario"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-4">
                        <BookOpen className="flex-shrink-0 mt-1 text-blue-500" size={24} />
                        <p className="text-gray-600">
                            Aquí encontrarás Cuestionarios tipo Evaluación para prepararte para tus exámenes.
                        </p>
                    </div>

                    <div className="flex items-start gap-4">
                        <BrainCircuit className="flex-shrink-0 mt-1 text-yellow-500" size={24} />
                        <p className="font-semibold text-gray-800">
                            Diviértete aprendiendo y no olvides que...
                            <br />
                            <span className="text-primary flex items-center gap-2 mt-2">
                                <Award className="inline" /> Si Yo lo puedo hacer, Tú también lo puedes hacer!
                            </span>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <Button
                        size="lg"
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        onClick={handleStart}
                        disabled={updateProfileMutation.isPending}
                    >
                        <Rocket size={24} />
                        {updateProfileMutation.isPending ? 'Guardando...' : '¡Comencemos!'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
