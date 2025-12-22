import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIMarkdown } from '@/components/ui/ai-markdown';

interface ExplanationModalProps {
    question: string;
    correctAnswer: string;
    quizTitle: string; // Asegúrate que esta prop está definida
    onClose: () => void;
}

export function ExplanationModal({ question, correctAnswer, quizTitle, onClose }: ExplanationModalProps) {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            setError('Tiempo de espera agotado. Por favor intenta nuevamente.');
            setLoading(false);
        }, 20000);

        const fetchExplanation = async () => {
            try {
                const response = await fetch('/api/explain-answer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question,
                        correctAnswer,
                        quizTitle,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                clearTimeout(timeoutId);

                if (!data.content) {
                    throw new Error('La API no devolvió contenido');
                }

                setExplanation(data.content);
                setLoading(false);
            } catch (err) {
                clearTimeout(timeoutId);
                setError(err instanceof Error ? err.message : 'Error al generar la explicación');
                setLoading(false);
            }
        };

        fetchExplanation();

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [question, correctAnswer, quizTitle]); // Asegúrate que quizTitle está en las dependencias

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl mx-auto bg-white shadow-xl">
                <CardHeader className="relative">
                    <CardTitle className="text-xl font-semibold text-primary">
                        📚 Explicación ejercicio del cuestionario: {quizTitle} {/* Muestra el título aquí */}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-4 top-4"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-gray-600">Generando explicación para {quizTitle}...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 space-y-4">
                            <p className="text-red-500">{error}</p>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Reintentar
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Pregunta:</h4>
                                    <div className="text-gray-700 break-words whitespace-normal">
                                        <AIMarkdown content={question} />
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-2">Respuesta correcta:</h4>
                                    <div className="text-gray-700 break-words whitespace-normal">
                                        <AIMarkdown content={correctAnswer} />
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-2">Solución paso a paso:</h4>
                                    <div className="text-gray-700 space-y-4 break-words whitespace-normal">
                                        {explanation && <AIMarkdown content={explanation} />}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
