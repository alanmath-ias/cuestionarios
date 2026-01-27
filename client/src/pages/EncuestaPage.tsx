import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Sparkles, User, Users, Brain, BookOpen, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AIMarkdown } from "@/components/ui/ai-markdown";

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
  rawWalc?: number;
} & {
  // Permite acceso indexado para otros campos dinámicos
  [key: string]: string | number | undefined;
};

export default function EncuestaPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const ageGroup = searchParams.get('ageGroup') as 'child' | 'teen' | null;

  // Estado para los tests completados
  const [completedTests, setCompletedTests] = useState<number[]>(() => {
    const savedCompleted = localStorage.getItem('completedTests');
    return savedCompleted ? JSON.parse(savedCompleted) : [];
  });

  const ageConversionMap: Record<number, number> = {
    7: 15, 8: 15, 9: 15, 10: 16, 11: 17, 12: 18, 13: 19, 14: 20, 15: 21, 16: 22
  };

  const dalcConversionMap: Record<number, number> = {
    0: 1, 1: 2, 2: 3, 3: 4, 4: 5
  };

  const walcConversionMap: Record<number, number> = {
    0: 1, 1: 2, 2: 3, 3: 4, 4: 5
  };

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  const getDefaultFormData = (group: 'child' | 'teen' | null): FormData => ({
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
    romantic: group === 'child' ? 'no' : 'no',
    famrel: 4,
    freetime: 3,
    goout: 2,
    Dalc: 1,
    Walc: 1,
    health: 4,
    absences: 2,
    G1: 0,
    G2: 0,
  });

  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('surveyFormData');
    const defaultData = getDefaultFormData(ageGroup);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge parsed data with defaults to ensure all fields exist
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error("Error parsing saved form data", e);
        return defaultData;
      }
    }
    return defaultData;
  });

  const [deepSeekFeedback, setDeepSeekFeedback] = useState<string | null>(null);

  // Auto-save form data
  useEffect(() => {
    localStorage.setItem('surveyFormData', JSON.stringify(formData));
  }, [formData]);

  // Scroll to top on prediction
  useEffect(() => {
    if (prediction !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [prediction]);

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

    if (shouldReset) {
      localStorage.removeItem('surveyFormData');
      localStorage.removeItem('completedTests');
      localStorage.setItem('userAgeGroup', urlAgeGroup || '');

      setFormData(getDefaultFormData(urlAgeGroup));
      setCompletedTests([]);
      setPrediction(null);
    }

    const quizResult = sessionStorage.getItem('quizResult');
    if (quizResult) {
      const { field, value, quizId } = JSON.parse(quizResult);
      // IDs 68 (Lenguaje Niños) and 69 (Lenguaje Adolescentes) map to G1
      // IDs 73 (Matemáticas Niños) and 72 (Matemáticas Adolescentes) map to G2
      const expectedField = [68, 69].includes(quizId) ? 'G1' : 'G2';

      if (field === expectedField) {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setCompletedTests((prev) => {
          const updated = [...prev, quizId];
          localStorage.setItem('completedTests', JSON.stringify(updated));
          return updated;
        });
      }
      sessionStorage.removeItem('quizResult');
    }
  }, [location, setLocation]);

  useEffect(() => {
    localStorage.setItem('completedTests', JSON.stringify(completedTests));
  }, [completedTests]);

  const handleChange = (field: string, value: string | number) => {
    if (field === 'age') {
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      const convertedAge = ageConversionMap[numericValue] || numericValue;
      setFormData((prev) => ({ ...prev, [field]: convertedAge }));
    }
    else if (field === 'Dalc' && ageGroup === 'teen') {
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      const convertedDalc = dalcConversionMap[numericValue] || numericValue;
      setFormData((prev) => ({ ...prev, [field]: convertedDalc }));
    }
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
    const getNum = (value: string | number): number =>
      typeof value === 'string' ? parseFloat(value) || 0 : value;

    const mathScore = getNum(formData.G2);
    const adjustmentFactor = 0.3 + 0.7 * (1 - mathScore / 20);

    let rawAdjustment = 0;

    if (formData.paid === 'yes') rawAdjustment += 2;

    const g1Score = getNum(formData.G1);
    const g1Adjustment = (g1Score / 20) * 6 - 3;
    rawAdjustment += g1Adjustment;

    if (formData.higher === 'no') rawAdjustment -= 3;
    if (getNum(formData.studytime) >= 3) rawAdjustment += 1.5;
    if (getNum(formData.studytime) <= 1) rawAdjustment -= 1.5;
    if (getNum(formData.failures) > 0) rawAdjustment -= getNum(formData.failures) * 1.2;
    if (getNum(formData.traveltime) === 3) rawAdjustment -= 1.2;
    if (getNum(formData.traveltime) === 4) rawAdjustment -= 2;

    if (formData.famsup === 'yes') rawAdjustment += 1.5;
    if (getNum(formData.famrel) >= 4) rawAdjustment += 1.2;
    if (getNum(formData.famrel) <= 2) rawAdjustment -= 1;
    if (getNum(formData.Medu) >= 2) rawAdjustment += 0.8;
    if (getNum(formData.Fedu) >= 2) rawAdjustment += 0.8;

    if (ageGroup === 'teen') {
      if (getNum(formData.Dalc) >= 3) rawAdjustment -= 1.5;
      if (getNum(formData.Walc) >= 3) rawAdjustment -= 1;
    }

    if (getNum(formData.health) <= 2) rawAdjustment -= 0.7;
    if (getNum(formData.absences) > 10) rawAdjustment -= getNum(formData.absences) * 0.05;

    if (formData.internet === 'no') rawAdjustment -= 1.2;
    if (formData.schoolsup === 'yes') rawAdjustment += 1;

    const paidAdjustment = (formData.paid === 'yes') ? 1 : 0;
    const otherAdjustments = rawAdjustment - paidAdjustment;
    const finalAdjustment = paidAdjustment + (otherAdjustments * adjustmentFactor);

    const boundedAdjustment = Math.max(-5, Math.min(5, finalAdjustment));
    return Math.max(0, Math.min(20, basePrediction + boundedAdjustment));
  };

  const consultarDeepSeek = async (data: FormData, prediction: number) => {
    try {
      const res = await fetch('/api/encuesta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: data, prediction }),
      });

      if (!res.ok) {
        throw new Error('Error al obtener feedback');
      }

      const result = await res.json();
      return result.feedback;
    } catch (error) {
      console.error("Error consultando DeepSeek:", error);
      return "No pudimos generar tus consejos personalizados en este momento, pero sigue esforzándote.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    localStorage.setItem('surveyFormData', JSON.stringify(formData));

    try {
      const res = await fetch('https://prediccion.alanmath.com/predecir', {
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

  const shouldShowAlcoholField = ageGroup === 'teen';
  const shouldShowRomanticField = ageGroup === 'teen';

  const publicQuizzes = [
    { id: 68, title: 'Test de Lenguaje Niños', forAge: 'child' },
    { id: 69, title: 'Test de Lenguaje', forAge: 'teen' },
    { id: 73, title: 'Test de Matemáticas Niños', forAge: 'child' },
    { id: 72, title: 'Test de Matemáticas 2', forAge: 'teen' },
  ].filter(quiz => {
    return quiz.forAge === ageGroup;
  });

  const areTestsCompleted = publicQuizzes.every(q => completedTests.includes(q.id));

  if (!ageGroup) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
          {/* Ambient Background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
          </div>

          <Card className="max-w-md w-full bg-slate-900/80 border-white/10 backdrop-blur-md shadow-2xl relative z-10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white mb-2">¡Bienvenido!</CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Para comenzar, por favor selecciona tu rango de edad.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <Button
                onClick={() => setLocation('/encuestapage?ageGroup=child')}
                className="h-20 text-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full group-hover:scale-110 transition-transform">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Niño</div>
                    <div className="text-sm text-blue-300/70">7 - 12 años</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setLocation('/encuestapage?ageGroup=teen')}
                className="h-20 text-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Adolescente</div>
                    <div className="text-sm text-purple-300/70">13 - 17 años</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto py-10 px-4 relative z-10 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-400" />
              Diagnóstico Inicial
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Completa este formulario para recibir una predicción de tu rendimiento académico y recomendaciones personalizadas impulsadas por IA.
            </p>
          </div>

          {prediction !== null && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="bg-slate-900/80 border-blue-500/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold text-white mb-2">Tu Predicción</h2>
                      <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        {(prediction / 2).toFixed(1)}<span className="text-2xl text-slate-500">/10</span>
                      </div>
                      <p className="text-slate-400 mb-4">Nota final estimada</p>
                      <div className="flex gap-2 justify-center md:justify-start">
                        <Badge variant="outline" className={`${prediction >= 16 ? 'text-green-400 border-green-500/30 bg-green-500/10' : prediction >= 12 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'} `}>
                          {prediction >= 16 ? 'Excelente' : prediction >= 12 ? 'Bueno' : 'Necesita Mejora'}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        Consejos de IA
                      </h3>
                      {deepSeekFeedback ? (
                        <div className="text-slate-300 text-sm leading-relaxed">
                          <AIMarkdown content={deepSeekFeedback} className="prose-invert [&_*]:text-slate-300" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8 text-slate-500">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Generando consejos...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 🧍 Datos personales */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <User className="h-5 w-5 text-blue-400" />
                  Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Sexo</Label>
                  <Select value={formData.sex as string} onValueChange={(v) => handleChange('sex', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="M">Masculino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Edad</Label>
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
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo de vivienda</Label>
                  <Select value={formData.address as string} onValueChange={(v) => handleChange('address', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="U">Urbana</SelectItem>
                      <SelectItem value="R">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 👪 Información familiar */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Users className="h-5 w-5 text-purple-400" />
                  Información Familiar
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Tamaño de la familia</Label>
                  <Select value={formData.famsize as string} onValueChange={(v) => handleChange('famsize', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="LE3">Menor o igual a 3</SelectItem>
                      <SelectItem value="GT3">Mayor a 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Estado de convivencia paterna</Label>
                  <Select value={formData.Pstatus as string} onValueChange={(v) => handleChange('Pstatus', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="T">Juntos</SelectItem>
                      <SelectItem value="A">Separados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Nivel educativo de la madre</Label>
                  <Select value={String(formData.Medu)} onValueChange={(v) => handleChange('Medu', Number(v))}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="0">Sin formación</SelectItem>
                      <SelectItem value="1">Básica</SelectItem>
                      <SelectItem value="2">Profesional</SelectItem>
                      <SelectItem value="3">Maestría</SelectItem>
                      <SelectItem value="4">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Nivel educativo del padre</Label>
                  <Select value={String(formData.Fedu)} onValueChange={(v) => handleChange('Fedu', Number(v))}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="0">Sin formación</SelectItem>
                      <SelectItem value="1">Básica</SelectItem>
                      <SelectItem value="2">Profesional</SelectItem>
                      <SelectItem value="3">Maestría</SelectItem>
                      <SelectItem value="4">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Ocupación de la madre</Label>
                  <Select value={formData.Mjob as string} onValueChange={(v) => handleChange('Mjob', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="teacher">Docente</SelectItem>
                      <SelectItem value="health">Salud</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="at_home">Ama de casa</SelectItem>
                      <SelectItem value="other">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Ocupación del padre</Label>
                  <Select value={formData.Fjob as string} onValueChange={(v) => handleChange('Fjob', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="teacher">Docente</SelectItem>
                      <SelectItem value="health">Salud</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="at_home">Ama de casa</SelectItem>
                      <SelectItem value="other">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tutor legal</Label>
                  <Select value={formData.guardian as string} onValueChange={(v) => handleChange('guardian', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="mother">Madre</SelectItem>
                      <SelectItem value="father">Padre</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Calidad de la Relación Familiar (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.famrel as number}
                    onChange={(e) => handleChange('famrel', +e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 🧠 Estilo de vida */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Brain className="h-5 w-5 text-pink-400" />
                  Estilo de Vida
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shouldShowRomanticField && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Tiene pareja</Label>
                    <Select value={formData.romantic as string} onValueChange={(v) => handleChange('romantic', v)}>
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        <SelectItem value="yes">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">Actividades extracurriculares</Label>
                  <Select value={formData.activities as string} onValueChange={(v) => handleChange('activities', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="yes">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Internet en casa</Label>
                  <Select value={formData.internet as string} onValueChange={(v) => handleChange('internet', v)}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="yes">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tiempo libre diario (horas)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.freetime as number}
                    onChange={(e) => handleChange('freetime', +e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Salidas con amigos (días/semana)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.goout as number}
                    onChange={(e) => handleChange('goout', +e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>

                {shouldShowAlcoholField && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Alcohol entre semana (0-4)</Label>
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
                        className="bg-slate-800/50 border-white/10 text-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Alcohol fin de semana (0-4)</Label>
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
                        className="bg-slate-800/50 border-white/10 text-slate-200"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">Estado de salud (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.health as number}
                    onChange={(e) => handleChange('health', +e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 📚 Información académica */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <BookOpen className="h-5 w-5 text-yellow-400" />
                  Información Académica
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['schoolsup', 'famsup', 'paid', 'nursery', 'higher'] as const).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="text-slate-300">
                      {field === 'schoolsup' && 'Apoyo educativo adicional'}
                      {field === 'famsup' && 'Apoyo familiar'}
                      {field === 'paid' && 'Clases Extra Personalizadas'}
                      {field === 'nursery' && 'Asistió a preescolar'}
                      {field === 'higher' && 'Desea educación superior'}
                    </Label>
                    <Select value={formData[field] as string} onValueChange={(v) => handleChange(field, v)}>
                      <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        <SelectItem value="yes">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <div className="space-y-2">
                  <Label className="text-slate-300">Tiempo de viaje a la escuela</Label>
                  <Select value={String(formData.traveltime)} onValueChange={(v) => handleChange('traveltime', Number(v))}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="1">Menos de 15 minutos</SelectItem>
                      <SelectItem value="2">15 a 30 minutos</SelectItem>
                      <SelectItem value="3">30 a 60 minutos</SelectItem>
                      <SelectItem value="4">Más de una hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tiempo semanal de estudio</Label>
                  <Select value={String(formData.studytime)} onValueChange={(v) => handleChange('studytime', Number(v))}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="1">Menos de 2 horas</SelectItem>
                      <SelectItem value="2">2 a 5 horas</SelectItem>
                      <SelectItem value="3">5 a 10 horas</SelectItem>
                      <SelectItem value="4">Más de 10 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Materias reprobadas</Label>
                  <Select value={String(formData.failures)} onValueChange={(v) => handleChange('failures', Number(v))}>
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-200">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Inasistencias escolares</Label>
                  <Input
                    type="number"
                    min={0}
                    max={93}
                    value={formData.absences as number}
                    onChange={(e) => handleChange('absences', +e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Public Quizzes Section */}
            {publicQuizzes.length > 0 && (
              <div className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  Tests Requeridos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {publicQuizzes.map((quiz) => {
                    const isCompleted = completedTests.includes(quiz.id);
                    return (
                      <Card key={quiz.id} className="bg-slate-900/50 border-white/10 hover:border-blue-500/30 transition-all hover:bg-slate-800/50">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg mb-1">{quiz.title}</h3>
                            <p className="text-slate-400 text-sm">
                              {isCompleted ? 'Completado' : 'Pendiente'}
                            </p>
                          </div>
                          {isCompleted ? (
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-green-400" />
                            </div>
                          ) : (
                            <Link href={`/quiz/${quiz.id}`}>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Comenzar <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center pt-6 gap-4">
              {!areTestsCompleted && (
                <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Debes completar los tests requeridos para obtener tu predicción.</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading || !areTestsCompleted}
                className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105 ${(!areTestsCompleted || loading) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Obtener Predicción
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}