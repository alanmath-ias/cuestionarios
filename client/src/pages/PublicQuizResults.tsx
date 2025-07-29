import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

function PublicQuizResults() {
  const [_, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Obtener todos los parámetros necesarios
  const score = Number(searchParams.get('score')) || 0;
  const totalPoints = Number(searchParams.get('total')) || 1;
  const correctAnswers = Number(searchParams.get('correct')) || 0;
  const totalQuestions = Number(searchParams.get('totalQuestions')) || 1;
  const quizTitle = searchParams.get('quizTitle') || 'Cuestionario Público';
  const quizId = Number(searchParams.get('quizId')) || 0;
  const source = searchParams.get('source');
  const ageGroup = searchParams.get('ageGroup') as 'child' | 'teen' | null;
  console.log('[DEBUG] ageGroup obtenido en PublicQuizResults:', ageGroup);
  // Calcular puntaje escalado (0-20)
  const scaledScore = Math.min(10, Math.round((score / totalPoints) * 10));
  
  // Determinar campo a actualizar
  const fieldToUpdate = [68, 69].includes(quizId) ? 'G1' : 'G2';
  const testType = [68, 69].includes(quizId) ? 'Lenguaje' : 'Matemáticas';

/* Lista de cuestionarios públicos, ojo se debe cambiar abajo tambien 
  const isLanguageTest = [64, 52],

  El componente activepublicquiz tambíen requiere cambio:
  const PUBLIC_QUIZ_IDS = [64, 52, 3, 5];

  así como publicquizresult:
  const fieldToUpdate = [64, 52].includes(quizId) ? 'G1' : 'G2';
  const testType = [64, 52].includes(quizId) ? 'Lenguaje' : 'Matemáticas';

  Routes:
  const publicQuizIds = [64, 52, 3, 5]; // IDs de cuestionarios públicos - cuestionarios para encuesta modelo tests
  
*/

  // Guardar ageGroup en localStorage para persistencia
  useEffect(() => {
    if (ageGroup) {
      localStorage.setItem('userAgeGroup', ageGroup);
    }
  }, [ageGroup]);

  // Guardar resultado de forma consistente
  useEffect(() => {
    const resultData = {
      field: fieldToUpdate,
      value: scaledScore * 2, // Desnormalizar para guardar entre 0-20
      quizId,
      timestamp: new Date().toISOString(),
      ageGroup // Incluimos ageGroup en los datos guardados
    };

    // 1. Guardar en sessionStorage para uso inmediato
    sessionStorage.setItem('quizResult', JSON.stringify(resultData));

    // 2. Actualizar localStorage usando la misma key que EncuestaPage (surveyFormData)
    const surveyFormData = JSON.parse(localStorage.getItem('surveyFormData') || '{}');
    
    // Actualizar el campo correspondiente
    surveyFormData[fieldToUpdate] = scaledScore * 2; // Desnormalizar para guardar entre 0-20
    
    // Forzar valores para child si es necesario
    if (ageGroup === 'child') {
      surveyFormData.romantic = 'no';
      surveyFormData.Dalc = 1;
      surveyFormData.Walc = 1;
    }
    
    localStorage.setItem('surveyFormData', JSON.stringify(surveyFormData));
    localStorage.setItem('completedTests', 
        JSON.stringify([...(JSON.parse(localStorage.getItem('completedTests') || '[]')), quizId])
      );

  }, [scaledScore, fieldToUpdate, quizId, ageGroup]);

  const handleReturn = () => {
    if (source === 'encuesta') {
      // Retornar conservando siempre el ageGroup
      setLocation(`/encuestapage?ageGroup=${ageGroup || ''}`);
    } else {
      setLocation('/free-quizzes');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3"
          onClick={handleReturn}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">
          Resultados: {quizTitle} <Badge variant="secondary">{testType}</Badge>
        </h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-500">Puntaje (0-10)</p>
              <p className="text-3xl font-bold">{scaledScore}</p>
              <Badge variant={
                scaledScore >= 8 ? 'success' :
                scaledScore >= 5 ? 'secondary' : 'destructive'
              }>
                {scaledScore >= 8 ? 'Excelente' :
                 scaledScore >= 5 ? 'Aceptable' : 'Necesitas mejorar'}
              </Badge>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-500">Correctas</p>
              <p className="text-3xl font-bold">
                {correctAnswers} / {totalQuestions}
              </p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-500">Porcentaje</p>
              <p className="text-3xl font-bold">
                {Math.round((correctAnswers / totalQuestions) * 100)}%
              </p>
            </div>
          </div>

          <div className="mt-2 text-sm text-center text-muted-foreground">
            {fieldToUpdate === 'G1' 
              ? "Este resultado se ha guardado en tu puntaje de Lenguaje (G1)"
              : "Este resultado se ha guardado en tu puntaje de Matemáticas (G2)"}
          </div>

          <div className="text-center mt-6">
            <Button 
              onClick={handleReturn}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6"
            >
              {source === 'encuesta' ? 'Volver a la Encuesta' : 'Volver a Cuestionarios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PublicQuizResults;