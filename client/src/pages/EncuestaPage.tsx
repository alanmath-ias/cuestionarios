import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';

import { Link } from 'wouter';

import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react'; // Importar useEffect
import { useLocation } from 'wouter'; // Importar useLocation
import { Badge } from '@/components/ui/badge'; // Añade esta línea

type FormData = {
  // Campos regulares
  sex: string;
  age: number;
  address: string;
  famsize: string;
  Pstatus: string;
  Medu: number;
  Fedu: number;
  Mjob: string;
  Fjob: string;
  reason: string;
  guardian: string;
  traveltime: number;
  studytime: number;
  failures: number;
  schoolsup: string;
  famsup: string;
  paid: string;
  activities: string;
  nursery: string;
  higher: string;
  internet: string;
  romantic: string;
  famrel: number;
  freetime: number;
  goout: number;
  Dalc: number;
  Walc: number;
  health: number;
  absences: number;
  G1: number;
  G2: number;
  // Campos adicionales para conversión
  rawAge?: number;
  rawDalc?: number;
} & {
  // Permite acceso indexado para otros campos dinámicos
  [key: string]: string | number | undefined;
};

export default function EncuestaPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const ageGroup = searchParams.get('ageGroup') as 'child' | 'teen' | null;

  // Estado para los tests completados
  const [completedTests, setCompletedTests] = useState<number[]>(() => {
    const savedCompleted = localStorage.getItem('completedTests');
    return savedCompleted ? JSON.parse(savedCompleted) : [];
  });

  /* Lista de cuestionarios públicos, ojo se debe cambiar tambien 
  const isLanguageTest = [64, 52],

  El componente activepublicquiz tambíen requiere cambio:
  const PUBLIC_QUIZ_IDS = [64, 52, 3, 5];

  así como publicquizresult:
  const fieldToUpdate = [64, 52].includes(quizId) ? 'G1' : 'G2';
  const testType = [64, 52].includes(quizId) ? 'Lenguaje' : 'Matemáticas';

  Routes:
  const publicQuizIds = [64, 52, 3, 5]; // IDs de cuestionarios públicos - cuestionarios para encuesta modelo tests
  
   */
  const publicQuizzes = [
    { id: 68, title: 'Test de Lenguaje Niños', forAge: 'child' },
    { id: 69, title: 'Test de Lenguaje', forAge: 'teen' },
    { id: 73, title: 'Test de Matemáticas Niños', forAge: 'child' },
    { id: 72, title: 'Test de Matemáticas 2', forAge: 'teen' },
  ].filter(quiz => {
    // Primero filtrar por edad
    const ageMatch = quiz.forAge === ageGroup;
    // Luego filtrar por tests no completados
    //const notCompleted = !completedTests.includes(quiz.id);
    console.log('[DEBUG] Filtrando cuestionarios:', { quiz, ageMatch});
  
    return ageMatch;// && notCompleted;
  });

  const ageConversionMap: Record<number, number> = {
    7: 15,
    8: 15,
    9: 15,
    10: 16,
    11: 17,
    12: 18,
    13: 19,
    14: 20,
    15: 21,
    16: 22
  };
  
  const dalcConversionMap: Record<number, number> = {
    0: 1, // Muestra 0 → Guarda 1
    1: 2,
    2: 3,
    3: 4,
    4: 5
  };

  const walcConversionMap: Record<number, number> = {
    0: 1, // Muestra 0 → Guarda 1
    1: 2,
    2: 3,
    3: 4,
    4: 5
  };

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    sex: 'F',
    age: 12,
    address: 'U',
    famsize: 'GT3',
    Pstatus: 'T',
    Medu: 2,
    Fedu: 2,
    Mjob: 'other',
    Fjob: 'other',
    reason: 'course',
    guardian: 'mother',
    traveltime: 1,
    studytime: 2,
    failures: 0,
    schoolsup: 'no',
    famsup: 'no',
    paid: 'no',
    activities: 'no',
    nursery: 'yes',
    higher: 'yes',
    internet: 'yes',
    romantic: ageGroup === 'child' ? 'no' : 'no', // Siempre 'no' para child
    famrel: 4,
    freetime: 3,
    goout: 2,
    Dalc: 1, // Valor mínimo (Nunca) para todos
    Walc: 1, // Valor mínimo (Nunca) para todos
    health: 4,
    absences: 2,
    G1: 0,
    G2: 0,
  });

  const [_, setLocation] = useLocation();

  const [deepSeekFeedback, setDeepSeekFeedback] = useState<string | null>(null);



// En EncuestaPage, al inicio del componente:
useEffect(() => {
  if (ageGroup) {
    localStorage.setItem('userAgeGroup', ageGroup);
  }
}, [ageGroup]);



  useEffect(() => {
  const currentParams = new URLSearchParams(window.location.search);
  const urlAgeGroup = currentParams.get('ageGroup') as 'child' | 'teen' | null;
  
  if (urlAgeGroup) {
    localStorage.setItem('userAgeGroup', urlAgeGroup);
  } else {
    const savedAgeGroup = localStorage.getItem('userAgeGroup');
    if (savedAgeGroup) {
      currentParams.set('ageGroup', savedAgeGroup);
      setLocation(`/encuestapage?${currentParams.toString()}`);
    }
  }
  
  
  const shouldReset = currentParams.get('reset') === 'true';
  console.log('[DEBUG] URL Params:', { urlAgeGroup, shouldReset });

  // 1. Resetear datos si es necesario
  if (shouldReset) {
    console.log('[RESET] Reseteando datos de encuesta y tests completados');
    localStorage.removeItem('surveyFormData');
    localStorage.removeItem('completedTests');
    localStorage.setItem('userAgeGroup', urlAgeGroup || ''); // Guardar ageGroup igualmente

    // Resetear el estado local
    setFormData({
      sex: 'F',
      age: 16,
      address: 'U',
      famsize: 'GT3',
      Pstatus: 'T',
      Medu: 2,
      Fedu: 2,
      Mjob: 'other',
      Fjob: 'other',
      reason: 'course',
      guardian: 'mother',
      traveltime: 1,
      studytime: 2,
      failures: 0,
      schoolsup: 'no',
      famsup: 'no',
      paid: 'no',
      activities: 'no',
      nursery: 'yes',
      higher: 'yes',
      internet: 'yes',
      romantic: urlAgeGroup === 'child' ? 'no' : 'no', // Siempre 'no' para child
      famrel: 4,
      freetime: 3,
      goout: 2,
      Dalc: 1, // Valor mínimo (Nunca) para todos
      Walc: 1, // Valor mínimo (Nunca) para todos
      health: 4,
      absences: 2,
      G1: 0,
      G2: 0,
    });
    setCompletedTests([]); // Reiniciar tests completados
    setPrediction(null);
  } else {
    // 2. Cargar datos existentes si no hay reset
    console.log('[LOAD] Cargando datos existentes de encuesta y tests completados');
    const savedData = localStorage.getItem('surveyFormData');
    const savedCompleted = localStorage.getItem('completedTests');
    console.log('[DEBUG] Datos cargados:', { savedData, savedCompleted });

    if (savedCompleted) setCompletedTests(JSON.parse(savedCompleted));
    if (savedData) setFormData(JSON.parse(savedData));
  }

  // 3. Manejar quiz recién completado (sessionStorage)
  const quizResult = sessionStorage.getItem('quizResult');
  if (quizResult) {
    console.log('[QUIZ RESULT] Procesando resultado de test completado');
    const { field, value, quizId } = JSON.parse(quizResult);
    const expectedField = [1, 2].includes(quizId) ? 'G1' : 'G2';

    if (field === expectedField) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setCompletedTests((prev) => {
        const updated = [...prev, quizId];
        localStorage.setItem('completedTests', JSON.stringify(updated));
        return updated;
      });

      localStorage.setItem(
        'surveyFormData',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('surveyFormData') || '{}'),
          [field]: value,
        })
      );
    }
    sessionStorage.removeItem('quizResult'); // Limpiar sessionStorage
  }
}, [location]);

useEffect(() => {
  console.log('[SAVE] Guardando tests completados en localStorage');
  localStorage.setItem('completedTests', JSON.stringify(completedTests));
}, [completedTests]);


  const handleChange = (field: string, value: string | number) => {
    // Conversión especial para el campo 'age'
    if (field === 'age') {
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      const convertedAge = ageConversionMap[numericValue] || numericValue;
      setFormData((prev) => ({ ...prev, [field]: convertedAge }));
    } 
    // Conversión especial para el campo 'Dalc' (solo si es teen)
    else if (field === 'Dalc' && ageGroup === 'teen') {
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      const convertedDalc = dalcConversionMap[numericValue] || numericValue;
      setFormData((prev) => ({ ...prev, [field]: convertedDalc }));
    } 
    // Para Walc, solo permitir cambios si es teen
    else if (field === 'Walc' && ageGroup === 'teen') {
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      const convertedWalc = walcConversionMap[numericValue] || numericValue;
      setFormData((prev) => ({ ...prev, [field]: convertedWalc }));
    }
    else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const calculateAdjustedPrediction = (basePrediction: number, formData: FormData): number => {
    // Función helper para manejar valores numéricos
    const getNum = (value: string | number): number => 
      typeof value === 'string' ? parseFloat(value) || 0 : value;
  
    // 1. Calculamos el factor de ajuste basado en G2 (inversamente proporcional)
    const mathScore = getNum(formData.G2); // Nota de matemáticas (0-20)
    const adjustmentFactor = 0.3 + 0.7 * (1 - mathScore / 20); // Rango: 0.3 a 1
    
    // 2. Calculamos los ajustes base
    let rawAdjustment = 0;
  
    // Factores académicos (paid es constante, no se afecta por adjustmentFactor)
    if (formData.paid === 'yes') rawAdjustment += 2; // Clases pagadas (siempre suma 2 puntos completos)
    
    // Ajuste PROPORCIONAL para G1 (rango: -3 a +3)
    const g1Score = getNum(formData.G1);
    const g1Adjustment = (g1Score / 20) * 6 - 3; // Fórmula mágica
    rawAdjustment += g1Adjustment;

    // Resto de factores académicos (se afectan por adjustmentFactor)
    if (formData.higher === 'no') rawAdjustment -= 3;
    if (getNum(formData.studytime) >= 3) rawAdjustment += 1.5;
    if (getNum(formData.studytime) <= 1) rawAdjustment -= 1.5;
    if (getNum(formData.failures) > 0) rawAdjustment -= getNum(formData.failures) * 1.2;
    if (getNum(formData.traveltime) === 3) rawAdjustment -= 1.2; // Viaje de 30-60 minutos
    if (getNum(formData.traveltime) === 4) rawAdjustment -= 2; // Viaje de más de una hora
  
    // Entorno familiar (nuevo: apoyo familiar)
    if (formData.famsup === 'yes') rawAdjustment += 1.5; // Nuevo ajuste por apoyo familiar
    if (getNum(formData.famrel) >= 4) rawAdjustment += 1.2;
    if (getNum(formData.famrel) <= 2) rawAdjustment -= 1;
    if (getNum(formData.Medu) >= 2) rawAdjustment += 0.8;
    if (getNum(formData.Fedu) >= 2) rawAdjustment += 0.8;
  
    // Hábitos y estilo de vida (solo aplica para teens)
    if (ageGroup === 'teen') {
      if (getNum(formData.Dalc) >= 3) rawAdjustment -= 1.5;
      if (getNum(formData.Walc) >= 3) rawAdjustment -= 1;
    }
    
    if (getNum(formData.health) <= 2) rawAdjustment -= 0.7;
    if (getNum(formData.absences) > 10) rawAdjustment -= getNum(formData.absences) * 0.05;
  
    // Recursos educativos
    if (formData.internet === 'no') rawAdjustment -= 1.2;
    if (formData.schoolsup === 'yes') rawAdjustment += 1;
  
    // 3. Aplicamos el factor de ajuste inverso (excepto a paid)
    const paidAdjustment = (formData.paid === 'yes') ? 1 : 0;
    const otherAdjustments = rawAdjustment - paidAdjustment; // Aislamos el ajuste de paid
    const finalAdjustment = paidAdjustment + (otherAdjustments * adjustmentFactor);
  
    // 4. Aplicamos límites al ajuste final (máximo ±5)
    const boundedAdjustment = Math.max(-5, Math.min(5, finalAdjustment));
  
    // 5. Calculamos la predicción final (0-20)
    return Math.max(0, Math.min(20, basePrediction + boundedAdjustment));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
  
    // Guardar datos actuales antes de enviar
    localStorage.setItem('surveyFormData', JSON.stringify(formData));

    try {
      const res = await fetch('https://modelo-prediccion-api-production.up.railway.app/predecir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
      if (!res.ok || typeof data.prediccion !== 'number') {
        throw new Error('Error en la predicción');
      }
  
      const finalPrediction = calculateAdjustedPrediction(data.prediccion, formData);
      setPrediction(finalPrediction);
  
 // ⬇️ Aquí consultamos DeepSeek después de la predicción
 const feedback = await consultarDeepSeek(formData, finalPrediction);
 setDeepSeekFeedback(feedback);

    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'No se pudo obtener la predicción. Inténtalo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const consultarDeepSeek = async (formData: FormData, prediccion: number): Promise<string> => {
    const prompt = `
  Eres un experto en aprendizaje automático. Un modelo de predicción ha estimado el rendimiento académico de un estudiante con ${prediccion.toFixed(1)} / 20.
  
  Estos son los datos del estudiante:
  ${JSON.stringify(formData, null, 2)}
  
  Por favor, indica:
  1. Qué variables afectaron más negativamente el rendimiento y por qué.
  2. Qué variables pueden mejorar si el estudiante toma acción.
  3. Sugerencias específicas para mejorar el resultado futuro.
  Usa un lenguaje claro y orientado al estudiante.
    `;
    
    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          //'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          Authorization: `Bearer ${apiKey}`,

          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
  
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || 'No se pudo generar una recomendación.';
    } catch (error) {
      console.error('Error al consultar DeepSeek:', error);
      return 'Error al consultar DeepSeek.';
    }
  };
  

  const getFieldColor = (field: string, value: number | string): string => {
    // Define qué campos son "inversos" (donde valores bajos son buenos)
    const inverseFields = ['Dalc', 'Walc', 'goout', 'failures', 'absences', 'traveltime'];
    
    // Determina si el campo es inverso
    const isInverse = inverseFields.includes(field);

    // Campos que no deben mostrar color
    const noColorFields = ['nursery', 'sex', 'age', 'address', 'famsize', 'Pstatus', 'Mjob', 'Fjob', 'guardian'];
  
    // Si el campo no debe tener color, retorna cadena vacía
    if (noColorFields.includes(field)) return '';
    
    // Para campos booleanos (yes/no)
    if (typeof value === 'string') {
      if (['yes', 'no'].includes(value)) {
        const favorableResponses: Record<string, string> = {
          'schoolsup': 'yes',  // Cambiado a 'yes' porque el apoyo educativo es positivo
          'famsup': 'yes',
          'paid': 'yes',
          'nursery': 'yes',
          'higher': 'yes',
          'internet': 'yes',
          'activities': 'yes',
          'romantic': 'no'
        };
        const isFavorable = favorableResponses[field] === value;
        return isFavorable ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
      }
      return '';
    }
    
    // Para campos numéricos
    if (typeof value === 'number') {
      // Caso especial para nivel educativo de padres (Medu y Fedu)
      if (['Medu', 'Fedu'].includes(field)) {
        if (value === 0) return 'bg-red-100 border-red-300'; // Sin formación
        if (value === 1) return 'bg-yellow-100 border-yellow-300'; // Básica
        return 'bg-green-100 border-green-300'; // Profesional, Maestría o Doctorado
      }
      
      // Normalización de campos especiales
      let normalizedValue = value;
      
      // Normalizar G1 y G2 (de 0-20 a escala 1-5)
      if (['G1', 'G2'].includes(field)) {
        normalizedValue = Math.ceil((value / 20) * 5);
      }
      // Normalizar absences (de 0-93 a escala 1-5)
      else if (field === 'absences') {
        normalizedValue = Math.ceil((value / 93) * 5);
      }
      
      // Ajustamos la escala según si es inverso o no
      const adjustedValue = isInverse ? 5 - normalizedValue : normalizedValue;
      
      if (adjustedValue >= 4) return 'bg-green-100 border-green-300';
      if (adjustedValue >= 2.5) return 'bg-yellow-100 border-yellow-300';
      return 'bg-red-100 border-red-300';
    }
    
    return '';
  };

 // Obtener ageGroup de la URL en cada render
const currentParams = new URLSearchParams(window.location.search);
const currentAgeGroup = currentParams.get('ageGroup') as 'child' | 'teen' | null;

const shouldShowAlcoholField = currentAgeGroup === 'teen';
const shouldShowRomanticField = currentAgeGroup === 'teen';

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">📊 Encuesta de Diagnóstico Inicial</h1>

      <p className="text-center text-muted-foreground mb-6">
        Responde completamente este formulario para estimar tu posible rendimiento académico en matemáticas y recibir recomendaciones personalizadas al finalizar.
      </p>

      {prediction !== null && (
        <div className="flex justify-end items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Favorable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Desfavorable</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 🧍 Datos personales */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🧍 Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Sexo</Label>
              <Select value={formData.sex as string} onValueChange={(v) => handleChange('sex', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Edad</Label>
              <Input 
                type="number" 
                min={7} 
                max={16}
                value={(formData.rawAge as number) || Object.entries(ageConversionMap).find(([_, v]) => v === formData.age)?.[0] || formData.age}
                onChange={(e) => {
                  const rawValue = +e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    rawAge: rawValue,
                    age: ageConversionMap[rawValue] || rawValue
                  }));
                }}
                className={prediction !== null ? 'bg-gray-100 border-gray-300' : ''}
              />
            </div>
            <div>
              <Label>Tipo de vivienda</Label>
              <Select value={formData.address as string} onValueChange={(v) => handleChange('address', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U">Urbana</SelectItem>
                  <SelectItem value="R">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 👪 Información familiar */}
        <div>
          <h2 className="text-xl font-semibold mb-4">👪 Información familiar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tamaño de la familia</Label>
              <Select value={formData.famsize as string} onValueChange={(v) => handleChange('famsize', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LE3">Menor o igual a 3</SelectItem>
                  <SelectItem value="GT3">Mayor a 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado de convivencia paterna</Label>
              <Select value={formData.Pstatus as string} onValueChange={(v) => handleChange('Pstatus', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T">Juntos</SelectItem>
                  <SelectItem value="A">Separados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Nivel educativo de la madre</Label>
              <select
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  prediction !== null ? getFieldColor('Medu', formData.Medu as number) : 'border-gray-300'
                }`}
                value={formData.Medu}
                onChange={(e) => handleChange('Medu', Number(e.target.value))}
              >
                <option value={0} title="Sin formación">0 - Sin formación</option>
                <option value={1} title="Básica">1. Básica</option>
                <option value={2} title="Profesional">2. Profesional</option>
                <option value={3} title="Maestría">3. Maestría</option>
                <option value={4} title="Doctorado">4. Doctorado</option>
              </select>
            </div>

            <div>
              <Label>Nivel educativo del padre</Label>
              <select
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  prediction !== null ? getFieldColor('Fedu', formData.Fedu as number) : 'border-gray-300'
                }`}
                value={formData.Fedu}
                onChange={(e) => handleChange('Fedu', Number(e.target.value))}
              >
                <option value={0} title="Sin formación">0 - Sin formación</option>
                <option value={1} title="Básica">1. Básica</option>
                <option value={2} title="Profesional">2. Profesional</option>
                <option value={3} title="Maestría">3. Maestría</option>
                <option value={4} title="Doctorado">4. Doctorado</option>
              </select>
            </div>

            <div>
              <Label>Ocupación de la madre</Label>
              <Select value={formData.Mjob as string} onValueChange={(v) => handleChange('Mjob', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Docente</SelectItem>
                  <SelectItem value="health">Salud</SelectItem>
                  <SelectItem value="services">Servicios</SelectItem>
                  <SelectItem value="at_home">Ama de casa</SelectItem>
                  <SelectItem value="other">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ocupación del padre</Label>
              <Select value={formData.Fjob as string} onValueChange={(v) => handleChange('Fjob', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Docente</SelectItem>
                  <SelectItem value="health">Salud</SelectItem>
                  <SelectItem value="services">Servicios</SelectItem>
                  <SelectItem value="at_home">Ama de casa</SelectItem>
                  <SelectItem value="other">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tutor legal</Label>
              <Select value={formData.guardian as string} onValueChange={(v) => handleChange('guardian', v)}>
                <SelectTrigger className={prediction !== null ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Madre</SelectItem>
                  <SelectItem value="father">Padre</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Calidad de la Relación Familiar (1 = Mala, 5 = Excelente)</Label>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                value={formData.famrel as number} 
                onChange={(e) => handleChange('famrel', +e.target.value)}
                className={prediction !== null ? getFieldColor('famrel', formData.famrel as number) : ''}
              />
            </div>
          </div>
        </div>

        {/* 🧠 Estilo de vida */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🧠 Estilo de vida y hábitos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pregunta sobre pareja (solo para teens) */}
            {shouldShowRomanticField && (
              <div>
                <Label>Tiene pareja</Label>
                <Select value={formData.romantic as string} onValueChange={(v) => handleChange('romantic', v)}>
                  <SelectTrigger className={prediction !== null ? getFieldColor('romantic', formData.romantic as string) : ''}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}


            <div>
              <Label>Actividades extracurriculares</Label>
              <Select value={formData.activities as string} onValueChange={(v) => handleChange('activities', v)}>
                <SelectTrigger className={prediction !== null ? getFieldColor('activities', formData.activities as string) : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Acceso a internet en casa</Label>
              <Select value={formData.internet as string} onValueChange={(v) => handleChange('internet', v)}>
                <SelectTrigger className={prediction !== null ? getFieldColor('internet', formData.internet as string) : ''}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tiempo libre después de clases en horas</Label>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                value={formData.freetime as number} 
                onChange={(e) => handleChange('freetime', +e.target.value)}
                className={prediction !== null ? getFieldColor('freetime', formData.freetime as number) : ''}
              />
            </div>
            <div>
              <Label>Número de días de salidas con amigos por semana</Label>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                value={formData.goout as number} 
                onChange={(e) => handleChange('goout', +e.target.value)}
                className={prediction !== null ? getFieldColor('goout', formData.goout as number) : ''}
              />
            </div>

            {/* Mostrar campos de alcohol solo para teens */}
            {shouldShowAlcoholField && (
              <>
                <div>
                  <Label className="block">
                    <span className="block">Consumo de alcohol entre semana en días</span>
                    {/*<span className="block text-sm font-normal">(0 = Nunca, 4 = Siempre)</span>*/}
                  </Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={4}
                    value={(formData.rawDalc as number) ?? Object.entries(dalcConversionMap).find(([_, v]) => v === formData.Dalc)?.[0] ?? formData.Dalc}
                    onChange={(e) => {
                      const rawValue = +e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        rawDalc: rawValue,
                        Dalc: dalcConversionMap[rawValue] || rawValue
                      }));
                    }}
                    className={prediction !== null ? getFieldColor('Dalc', formData.Dalc as number) : ''}
                  />
                </div>

                <div>
                  <Label className="block">
                    <span className="block">Consumo de alcohol fin de semana</span>
                    <span className="block text-sm font-normal">(0 = Nunca, 4 = Siempre)</span>
                  </Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={4}
                    value={(formData.rawWalc as number) ?? Object.entries(walcConversionMap).find(([_, v]) => v === formData.Walc)?.[0] ?? formData.Walc}
                    onChange={(e) => {
                      const rawValue = +e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        rawWalc: rawValue,
                        Walc: walcConversionMap[rawValue] || rawValue
                      }));
                    }}
                    className={prediction !== null ? getFieldColor('Walc', formData.Walc as number) : ''}
                  />
                </div>

               {/*} <div>
  <Label className="block">
    <span className="block">Consumo de alcohol fin de semana</span>
    <span className="block text-sm font-normal">(0 = Nunca, 4 = Siempre)</span>
  </Label>
  <Input 
    type="number" 
    min={0} 
    max={4} 
    value={formData.Walc as number} // Mostrar el valor directamente
    onChange={(e) => handleChange('Walc', +e.target.value)} // Usar el valor ingresado directamente
    className={prediction !== null ? getFieldColor('Walc', formData.Walc as number) : ''}
  />
</div>*/}
              </>
            )}

            <div>
              <Label className="block">
                <span className="block">Nivel considerado de estado de salud</span>
                <span className="block text-sm font-normal">(1 = Bajo, 5 = Excelente)</span>
              </Label>
              <Input 
                type="number" 
                min={1} 
                max={5} 
                value={formData.health as number} 
                onChange={(e) => handleChange('health', +e.target.value)}
                className={prediction !== null ? getFieldColor('health', formData.health as number) : ''}
              />
            </div>
          </div>
        </div>

        {/* 📚 Información académica */}
        <div>
          <h2 className="text-xl font-semibold mb-4">📚 Información académica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['schoolsup','famsup','paid','nursery','higher'] as const).map((field) => (
              <div key={field}>
                <Label>
                  {field === 'schoolsup' && 'Apoyo educativo adicional'}
                  {field === 'famsup' && 'Apoyo familiar'}
                  {field === 'paid' && 'Clases Extra Personalizadas'}
                  {field === 'nursery' && 'Asistió a preescolar'}
                  {field === 'higher' && 'Desea educación superior'}
                </Label>
                <Select value={formData[field] as string} onValueChange={(v) => handleChange(field, v)}>
                  <SelectTrigger className={prediction !== null ? getFieldColor(field, formData[field] as string) : ''}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div>
              <Label>Tiempo de viaje a la escuela</Label>
              <select
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  prediction !== null ? getFieldColor('traveltime', formData.traveltime as number) : 'border-gray-300'
                }`}
                value={formData.traveltime as number}
                onChange={(e) => handleChange('traveltime', Number(e.target.value))}
              >
                <option value={1} title="Menos de 15 minutos">1. Menos de 15 minutos</option>
                <option value={2} title="15 a 30 minutos">2. 15 a 30 minutos</option>
                <option value={3} title="30 a 60 minutos">3. 30 a 60 minutos</option>
                <option value={4} title="Mas de una hora">4. Mas de una hora</option>
              </select>
            </div>
            <div>
              <Label>Horas de estudio semanal por cuenta propia (1-4)</Label>
              <Input 
                type="number" 
                min={1} 
                max={4} 
                value={formData.studytime as number} 
                onChange={(e) => handleChange('studytime', +e.target.value)}
                className={prediction !== null ? getFieldColor('studytime', formData.studytime as number) : ''}
              />
            </div>
            <div>
              <Label>Reprobaciones anteriores en matemáticas (0–4)</Label>
              <Input 
                type="number" 
                min={0} 
                max={4} 
                value={formData.failures as number} 
                onChange={(e) => handleChange('failures', +e.target.value)}
                className={prediction !== null ? getFieldColor('failures', formData.failures as number) : ''}
              />
            </div>
            <div>
              <Label>Número aproximado de ausencias escolares en un año (0-93)</Label>
              <Input 
                type="number" 
                min={0} 
                max={93} 
                value={formData.absences as number} 
                onChange={(e) => handleChange('absences', +e.target.value)}
                className={prediction !== null ? getFieldColor('absences', formData.absences as number) : ''}
              />
            </div>
            {/*
            <div>
              <Label>Puntaje Test de Lenguaje de AlanMath (0–10)</Label>
              <Input 
                type="number" 
                min={0} 
                max={20} 
                value={formData.G1 as number} 
                onChange={(e) => handleChange('G1', +e.target.value)}
                className={prediction !== null ? getFieldColor('G1', formData.G1 as number) : ''}
              />
            </div>
            <div>
              <Label>Puntaje Test de Lógica Matemática de AlanMath (0–10)</Label>
              <Input 
                type="number" 
                min={0} 
                max={20} 
                value={formData.G2 as number} 
                onChange={(e) => handleChange('G2', +e.target.value)}
                className={prediction !== null ? getFieldColor('G2', formData.G2 as number) : ''}
              />
            </div>
            */}
          </div>
        </div>

        {/* Encuestas Públicas */}
        {/* Sección de Tests con Puntajes Integrados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {publicQuizzes.map((quiz) => {
    // Identificar si el test es de lenguaje o matemáticas
    const isLanguageTest = [68, 69].includes(quiz.id); // IDs de lenguaje
    const fieldName = isLanguageTest ? 'G1' : 'G2'; // Usar G1 para lenguaje y G2 para matemáticas
    const fieldValue = (formData[fieldName] as number) / 2;
    const isCompleted = completedTests.includes(quiz.id);

    return (
      <div key={quiz.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{quiz.title}</h2>
            {completedTests.includes(quiz.id) && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                Completado ✓
              </Badge>
            )}
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>Puntaje (0-10)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={fieldValue}
                onChange={(e) => handleChange(fieldName, +e.target.value * 2)}// Guardar el valor desnormalizado
              />
            </div>

            <Link href={`/public-quiz/${quiz.id}?ageGroup=${ageGroup}&source=encuesta`}
            onClick={() => {
    localStorage.setItem('surveyFormData', JSON.stringify(formData));
  }} 
  >{/* onclick guarda al orpimir el boton en localstorage el efecto es "similar"*/}
  <Button
    variant="secondary"
    className="bg-blue-500 text-white hover:bg-blue-600 whitespace-nowrap"
  >
    {isCompleted ? 'Reintentar' : completedTests.includes(quiz.id) ? 'Volver a hacer' : 'Resolver'}
  </Button>
</Link>
          </div>
        </div>
      </div>
    );
  })}
</div>

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? (<><Loader2 className="animate-spin" size={18} /> Enviando...</>) :
            (<><Sparkles size={18} /> Obtener Predicción</>)}
        </Button>
      </form>

      {prediction !== null && (
        <div className="mt-8 bg-green-100 border border-green-300 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-green-800">🎯 Resultado de Predicción</h2>
          <p className="text-lg text-green-700 mb-4">
            Tu rendimiento estimado en matemáticas es de: <strong>{(prediction/2).toFixed(1)} / 10</strong>
          </p>
          {prediction < 10 ? (
            <p className="text-red-600 font-medium">
              Parece que hay algunas dificultades por el camino, pero no te preocupes, consulta con el equipo de AlanMath para ver como comenzamos a mejorar.
            </p>
          ) : prediction < 15 ? (
            <p className="text-yellow-600 font-medium">
              Vas por buen camino, pero podrías mejorar un montón. Consulta con el equipo de AlanMath para generar un plan de acción.
            </p>
          ) : (
            <p className="text-green-700 font-medium">
              ¡Excelente! Estás en condiciones geniales para llegar a la cima. Consulta con el equipo de AlanMath para establecer un programa que te lleve a lo más alto.
            </p>
          )}
        </div>
      )}

{deepSeekFeedback && (
  <div className="mt-8 bg-blue-100 border border-blue-300 rounded-lg p-6 text-left">
    <h2 className="text-xl font-semibold text-blue-800 mb-2">🧠 Sugerencias Personalizadas</h2>
    <pre className="whitespace-pre-wrap text-blue-700">{deepSeekFeedback}</pre>
  </div>
)}



    </div>
  );
}