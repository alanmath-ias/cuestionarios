
//Este anterior quiz-results esta super, ahora chat gpt lo modifica para que admin lo pueda ver y calificar, y que el admin pueda ver los resultados de todos los estudiantes, no solo de uno.
import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { QuizResult } from '@/shared/quiz-types';

function QuizResults() {
  const { progressId } = useParams<{ progressId: string }>();
  const [_, setLocation] = useLocation();
  
  // 1. Fetch quiz results
  const { data: results, isLoading: loadingResults } = useQuery<QuizResult>({
    queryKey: [`/api/results/${progressId}`],
  });

  // 2. Fetch complete quiz questions with answers
  const { data: quizQuestions, isLoading: loadingQuestions } = useQuery({
    queryKey: [`/api/quizzes/${results?.quiz.id}/questions`],
    enabled: !!results?.quiz.id // Only fetch if we have a quiz ID
  });
//Consultas para feedback:
const { data: feedback, isLoading: loadingFeedback } = useQuery({
  queryKey: ['quiz-feedback', progressId],
  queryFn: async () => {
    const res = await fetch(`/api/quiz-feedback/${progressId}`);
    if (!res.ok) return null;
    return res.json();
  },
  enabled: !!progressId,
});





//chat gpt constante para admin ver quiz-results
const [locationPath] = useLocation();
//const isAdminView = locationPath.includes('/admin/quiz-results');


  // Debug: Log data structure
  useEffect(() => {
    if (results) {
      console.log("Quiz results data:", results);
    }
    if (quizQuestions) {
      console.log("Quiz questions data:", quizQuestions);
    }
  }, [results, quizQuestions]);

  const isLoading = loadingResults || loadingQuestions;
  const correctAnswers = results?.answers.filter(a => a.isCorrect).length || 0;
  const totalQuestions = results?.answers.length || 0;

  const formatTimeSpent = (seconds?: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 3. Improved correct answer lookup
  const getCorrectAnswerContent = (answer: any): string | undefined => {
    if (!quizQuestions) return undefined;
    
    const fullQuestion = quizQuestions.find((q: any) => q.id === answer.question.id);
    const correctAnswer = fullQuestion?.answers.find((a: any) => a.isCorrect);
    return correctAnswer?.content;
  };

  const renderQuestionContent = (content: string) => {
    return content.split('*').map((part, i) => {
      if (i % 2 === 0) {
        return <span key={i}>{part}</span>;
      } else {
        return <MathDisplay key={i} math={part.trim()} inline />;
      }
    });
  };

  const handleDownloadResults = () => {
    if (!results) return;
    
    const headers = ['Pregunta', 'Tu Respuesta', 'Respuesta Correcta', 'Tiempo'];
    const rows = results.answers.map((answer, index) => [
      `Pregunta ${index + 1}`,
      answer.answerDetails?.content || 'No respondida',
      getCorrectAnswerContent(answer) || 'No disponible',
      formatTimeSpent(answer.timeSpent)
    ]);
    
    rows.push([
      `Puntuación: ${results.progress.score?.toFixed(1)}/10`,
      `Correctas: ${correctAnswers}/${totalQuestions}`,
      `Tiempo total: ${formatTimeSpent(results.progress.timeSpent)}`,
      ''
    ]);
    
    const csvContent = [
      `Resultados: ${results.quiz.title}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_${results.quiz.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="quizResults" className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">

 {/*}     
<Button 
  variant="ghost" 
  size="icon" 
  className="mr-3"
  onClick={() => setLocation(isAdminView ? '/admin/calificar' : '/')}
>
  <ArrowLeft className="h-5 w-5" />
</Button>*/}
        
        <h2 className="text-2xl font-semibold">Resultados del Cuestionario</h2>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      ) : results ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">{results.quiz.title}</h3>
              <div className="inline-flex items-center bg-blue-100 text-primary px-3 py-1.5 rounded-full text-sm">
                <Clock className="text-primary mr-1 h-4 w-4" />
                Completado en {formatTimeSpent(results.progress.timeSpent)} minutos
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Puntuación</div>
                <div className="text-3xl font-bold text-primary">
                  {results.progress.score?.toFixed(1)}<span className="text-lg text-gray-500">/10</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Preguntas Correctas</div>
                <div className="text-3xl font-bold text-green-500">
                  {correctAnswers}<span className="text-lg text-gray-500">/{totalQuestions}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Tiempo promedio</div>
                <div className="text-3xl font-bold text-teal-500">
                  {Math.floor((results.progress.timeSpent || 0) / totalQuestions / 60)}
                  <span className="text-lg text-gray-500">
                    :{Math.floor((results.progress.timeSpent || 0) / totalQuestions % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">minutos por pregunta</div>
              </div>
            </div>
            
            <h4 className="font-semibold text-lg mb-4">Resumen de preguntas</h4>
            
            <div className="space-y-4 mb-6">
              {results.answers.map((answer, index) => {
                const correctContent = getCorrectAnswerContent(answer);
                
                return (
                  <div key={answer.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 flex justify-between items-center">
                      <div className="font-medium">Pregunta {index + 1}</div>
                      {answer.isCorrect ? (
                        <div className="text-green-500 font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Correcta
                        </div>
                      ) : (
                        <div className="text-red-500 font-medium flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Incorrecta
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-3">
                        {renderQuestionContent(answer.question.content)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`border rounded p-3 ${
                          answer.isCorrect 
                            ? 'bg-green-50 border-green-500' 
                            : 'bg-red-50 border-red-500'
                        }`}>
                          <div className="text-sm font-medium mb-1">Tu respuesta:</div>
                          {answer.answerDetails ? (
                            <MathDisplay math={answer.answerDetails.content} />
                          ) : (
                            <span className="text-gray-500">No respondida</span>
                          )}
                        </div>

                        {!answer.isCorrect && (
                          <div className="border rounded p-3 bg-green-50 border-green-500">
                            <div className="text-sm font-medium mb-1">Respuesta correcta:</div>
                            {correctContent ? (
                              <MathDisplay math={correctContent} />
                            ) : (
                              <span className="text-gray-500">
                                {loadingQuestions ? 'Cargando...' : 'No disponible'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {(answer.answerDetails?.explanation || answer.correctAnswer?.explanation) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                          <strong>Explicación:</strong> {answer.answerDetails?.explanation || answer.correctAnswer?.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {!loadingFeedback && (
  <Card className="mt-6">
    <CardContent className="p-6">
      <h4 className="text-lg font-semibold mb-2">Retroalimentación del profesor</h4>
      {feedback?.feedback ? (
        <p className="text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
      ) : (
        <p className="text-gray-500 italic">Tu profesor aún no ha enviado comentarios.</p>
      )}
    </CardContent>
  </Card>
)}




            <div className="flex justify-center">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleDownloadResults}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar resultados
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>No se encontraron resultados.</div>
      )}
    </div>
  );
}

export default QuizResults; //Este quiz-results comentado esta excelente para solo estudiantes pero le falta para admin veamos a ver si el siguiente lo resuelve:*/}
