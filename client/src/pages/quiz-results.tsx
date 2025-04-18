import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Download, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatTime } from '@/lib/mathUtils';

interface QuizResult {
  progress: {
    id: number;
    userId: number;
    quizId: number;
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    completedQuestions: number;
    timeSpent?: number;
    completedAt?: string;
  };
  quiz: {
    id: number;
    title: string;
    description: string;
    categoryId: number;
    timeLimit: number;
    difficulty: string;
    totalQuestions: number;
  };
  answers: Array<{
    id: number;
    progressId: number;
    questionId: number;
    answerId: number | null;
    isCorrect: boolean;
    variables: Record<string, number>;
    timeSpent: number;
    question: {
      id: number;
      content: string;
      type: string;
      difficulty: number;
      points: number;
    };
    answerDetails: {
      id: number;
      content: string;
      isCorrect: boolean;
      explanation?: string;
    } | null;
  }>;
}

function QuizResults() {
  const { progressId } = useParams<{ progressId: string }>();
  const [_, setLocation] = useLocation();
  
  // Fetch quiz results
  const { data: results, isLoading } = useQuery<QuizResult>({
    queryKey: [`/api/results/${progressId}`],
  });
  
  // Calculate statistics
  const correctAnswers = results?.answers.filter(a => a.isCorrect).length || 0;
  const totalQuestions = results?.answers.length || 0;
  const averageTimePerQuestion = results?.progress.timeSpent 
    ? Math.floor((results.progress.timeSpent / totalQuestions) / 60) : 0;
  const averageTimeSeconds = results?.progress.timeSpent 
    ? Math.floor((results.progress.timeSpent / totalQuestions) % 60) : 0;
  
  // Format time spent as mm:ss
  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle retry quiz
  const handleRetryQuiz = () => {
    if (results?.quiz.id) {
      setLocation(`/quiz/${results.quiz.id}`);
    }
  };
  
  // Handle download results
  const handleDownloadResults = () => {
    if (!results) return;
    
    // Create CSV content
    const headers = ['Pregunta', 'Respuesta', 'Correcta', 'Tiempo'];
    const rows = results.answers.map((answer, index) => [
      `Pregunta ${index + 1}`,
      answer.answerDetails?.content || 'No respondida',
      answer.isCorrect ? 'Sí' : 'No',
      formatTimeSpent(answer.timeSpent)
    ]);
    
    // Add summary row
    rows.push([
      `Puntuación: ${results.progress.score?.toFixed(1)}/10`,
      `Correctas: ${correctAnswers}/${totalQuestions}`,
      `Tiempo total: ${formatTimeSpent(results.progress.timeSpent)}`,
      ''
    ]);
    
    // Convert to CSV
    const csvContent = [
      `Resultados: ${results.quiz.title}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_${results.quiz.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div id="quizResults">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-3"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
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
                  {averageTimePerQuestion}<span className="text-lg text-gray-500">:{averageTimeSeconds.toString().padStart(2, '0')}</span>
                </div>
                <div className="text-xs text-gray-500">minutos por pregunta</div>
              </div>
            </div>
            
            <h4 className="font-semibold text-lg mb-4">Resumen de preguntas</h4>
            
            <div className="space-y-4 mb-6">
              {results.answers.map((answer, index) => (
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
                      <MathDisplay math={answer.question.content} display={true} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {answer.answerDetails && (
                        <div className={`border rounded p-3 ${answer.isCorrect 
                          ? 'bg-green-50 border-green-500' 
                          : 'bg-red-50 border-red-500'}`}>
                          <div className="text-sm font-medium mb-1">Tu respuesta:</div>
                          <MathDisplay math={answer.answerDetails.content} />
                        </div>
                      )}
                      
                      {/* Find correct answer */}
                      {!answer.isCorrect && (
                        <div className="border rounded p-3 bg-green-50 border-green-500">
                          <div className="text-sm font-medium mb-1">Respuesta correcta:</div>
                          <MathDisplay 
                            math={results.answers
                              .find(a => a.questionId === answer.questionId)
                              ?.answerDetails?.content || 'No disponible'} 
                          />
                        </div>
                      )}
                    </div>
                    
                    {answer.answerDetails?.explanation && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                        <strong>Explicación:</strong> {answer.answerDetails.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleDownloadResults}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar resultados
              </Button>
              <Button
                className="flex items-center"
                onClick={handleRetryQuiz}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p>No se encontraron resultados para este cuestionario.</p>
            <Button
              className="mt-4"
              onClick={() => setLocation('/')}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default QuizResults;
