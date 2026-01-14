import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X, BookOpen, CheckCircle2, HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIMarkdown } from '@/components/ui/ai-markdown';

interface ExplanationModalProps {
    questionId: number;
    question: string;
    correctAnswer: string;
    quizTitle: string;
    onClose: () => void;
}

export function ExplanationModal({ questionId, question, correctAnswer, quizTitle, onClose }: ExplanationModalProps) {
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
                        questionId,
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
    }, [question, correctAnswer, quizTitle]);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <Card className="w-full max-w-3xl mx-auto bg-slate-900 border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
                <CardHeader className="relative border-b border-white/5 pb-4">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        Explicación: <span className="text-slate-200 font-normal ml-1">{quizTitle}</span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 min-h-0 p-0 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                            <p>Generando explicación detallada...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                            <div className="bg-red-500/10 p-4 rounded-full">
                                <X className="h-8 w-8 text-red-500" />
                            </div>
                            <p className="text-red-400">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="border-slate-700 text-slate-200 hover:bg-slate-800"
                            >
                                Reintentar
                            </Button>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                            <div className="space-y-6 pb-6">
                                <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                    <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4" />
                                        Pregunta
                                    </h4>
                                    <div className="text-white text-lg leading-relaxed">
                                        <AIMarkdown content={question} className="text-white prose-invert" />
                                    </div>
                                </div>

                                <div className="p-5 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Respuesta Correcta
                                    </h4>
                                    <div className="text-white text-lg font-medium">
                                        <AIMarkdown content={correctAnswer} className="text-white prose-invert" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-500/20"></div>
                                    <div className="pl-10 py-2">
                                        <h4 className="font-medium text-white text-lg mb-4">Solución paso a paso</h4>
                                        <div className="text-white space-y-4 leading-relaxed explanation-content">
                                            {explanation && <AIMarkdown content={explanation} className="text-white prose-invert" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
