import { Button } from '@/components/ui/button';
import { Rocket, BookOpen, Award, BrainCircuit } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface User {
    id: number;
    name: string;
    username: string;
}

export default function WelcomePage() {
    const [_, setLocation] = useLocation();

    const { data: user } = useQuery<User>({
        queryKey: ['/api/user'],
        retry: false,
    });

    const bannerUrl = "https://imagenes.alanmath.com/nueva-actividad.jpg";

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src={bannerUrl} alt="Bienvenido a AlanMath" className="max-w-[200px] h-auto rounded-lg shadow-sm" />
                    </div>
                    <h1 className="text-4xl font-bold text-primary mb-2">¡Bienvenid@ a AlanMath!</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">Hola {user?.name || user?.username || 'Estudiante'}</h2>
                </div>

                <div className="space-y-6 text-lg">
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
                        onClick={() => {
                            setLocation('/');
                        }}
                    >
                        <Rocket size={24} />
                        ¡Comencemos!
                    </Button>
                </div>
            </div>
        </div>
    );
}
