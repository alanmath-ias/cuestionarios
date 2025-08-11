import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { MathDisplay } from '@/components/ui/math-display';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        const prompt = `Eres un tutor experto en ${quizTitle}. Resuelve este problema paso a paso:

**Contexto del Cuestionario:** ${quizTitle}
**Problema:** ${question}
**Respuesta Correcta:** ${correctAnswer}

Instrucciones:
1. Usa métodos específicos de ${quizTitle}
2. Muestra máximo 6 pasos numerados
3. Usa notación LaTeX (¡!) para matemáticas
4. Comienza directamente con la solución, no escribas "Solución", simplemente inicia con los pasos correspondientes
5. Cuando escribas algo como:  a = x y b = y No olvides usar Latex dos veces, una para a = x y otra para b = y, de modo que la "y" de la conjunción queda por fuera del Latex
6. No uses ninguna palabra en inglés nunca, asegúrate de escribir las palabras correspondientes y adecuadas en español

Ejemplo de formato:
1. Identificamos: ¡x^2 + bx + c! (problema de ${quizTitle})
2. Aplicamos: ¡fórmula!
3. Resolvemos: ¡operación!`;

        const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        clearTimeout(timeoutId);
        
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('La API no devolvió contenido');
        }

        setExplanation(data.choices[0].message.content);
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

  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('\n').map((paragraph, paraIndex) => {
      if (!paragraph.trim()) return null;

      const parts = paragraph.split('¡');
      
      return (
        <div key={`para-${paraIndex}`} className="mb-3">
          {parts.map((part, partIndex) => {
            if (partIndex % 2 === 0) {
              return (
                <span key={`text-${paraIndex}-${partIndex}`}>
                  {part}
                </span>
              );
            } else {
              const mathContent = part.split('!')[0];
              const remainingText = part.split('!').slice(1).join('!');
              
              return (
                <span key={`math-${paraIndex}-${partIndex}`}>
                  <MathDisplay math={mathContent.trim()} inline />
                  {remainingText}
                </span>
              );
            }
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl mx-auto bg-white shadow-xl">
        <CardHeader className="relative">
          <CardTitle className="text-xl font-semibold text-primary">
            📚 Explicación ejercicio sobre {quizTitle} {/* Muestra el título aquí */}
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
                  <div className="text-gray-700">{renderContent(question)}</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Respuesta correcta:</h4>
                  <div className="text-gray-700">{renderContent(correctAnswer)}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Solución paso a paso:</h4>
                  <div className="text-gray-700 space-y-4">
                    {explanation && renderContent(explanation)}
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