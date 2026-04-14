import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Wand2, Sparkles, Loader2, Coins, Brain, Clock, Zap, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, History, ArrowRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

interface MagicQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  userId: number;
  credits: number;
  userRole?: string;
}

export function MagicQuizDialog({ isOpen, onClose, categories, userId, credits, userRole }: MagicQuizDialogProps) {
  const [step, setStep] = useState(0); // 0: Choice, 1: Form
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    categoryId: "",
    subcategoryId: "all",
    topicDescription: "",
    questionCount: 10,
    difficulty: "medium",
    timeLimit: 15,
  });

  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const { data: userQuizzes } = useQuery<any[]>({
    queryKey: ["/api/user/quizzes"],
    enabled: isOpen && step === 0,
  });

  const magicHistory = userQuizzes?.filter(q => q.isAiGenerated) || [];

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.categoryId && formData.categoryId !== "all") {
      setLoadingSubcategories(true);
      fetch(`/api/admin/subcategories/by-category/${formData.categoryId}`)
        .then((res) => res.json())
        .then((data) => {
          setSubcategories(data);
          setLoadingSubcategories(false);
        })
        .catch(() => {
          setLoadingSubcategories(false);
          setSubcategories([]);
        });
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId]);

  const handleGenerate = async () => {
    if (!formData.categoryId || !formData.topicDescription) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, elige una materia y describe el tema.",
        variant: "destructive",
      });
      return;
    }

    if (credits < 10 && userRole !== 'admin') {
      toast({
        title: "Créditos insuficientes",
        description: "Necesitas 10 créditos para usar la magia de la IA.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/ai/generate-quiz", {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        subcategoryId: formData.subcategoryId === "all" ? null : parseInt(formData.subcategoryId),
      });
      
      const data = await res.json();
      
      toast({
        title: "¡Magia completada!",
        description: "Tu cuestionario ha sido creado por la IA.",
      });

      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
      
      onClose();
      setTimeout(() => {
        setLocation(`/quiz/${data.quizId}`);
      }, 500);
    } catch (error: any) {
      let errorMessage = "Hubo un problema al contactar con la IA.";
      
      // Try to extract a clean message if it's a JSON error from apiRequest
      if (error.message) {
        try {
          // apiRequest formats errors as "Status: { JSON }"
          const jsonPart = error.message.split(": ").slice(1).join(": ");
          if (jsonPart) {
            const parsed = JSON.parse(jsonPart);
            errorMessage = parsed.message || parsed.error || errorMessage;
          } else {
            errorMessage = error.message;
          }
        } catch (e) {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error mágico",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-slate-950 border border-amber-500/30 text-white overflow-hidden p-0 [&>button]:z-[100] [&>button]:opacity-100 [&>button]:text-slate-400 [&>button]:hover:text-amber-400 [&>button]:transition-colors">
        {/* Magic Background Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px]" />
        </div>

        <DialogHeader className="relative z-10 px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-amber-400">
            <Wand2 className="h-6 w-6 animate-pulse" />
            Cuestionario Mágico
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 0 
              ? "Gestiona tus creaciones o invoca un nuevo desafío con IA." 
              : "Crea una experiencia de aprendizaje a medida usando el poder de la IA."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 px-6 relative z-10">
          <AnimatePresence mode="wait">
            {!isGenerating ? (
              step === 0 ? (
                <motion.div
                  key="choice"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-600/20 to-amber-500/10 border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/20 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-100">Crear Nuevo Cuestionario</h4>
                          <p className="text-xs text-amber-200/50">Describe un tema y la IA hará el resto.</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-amber-500/50" />
                    </button>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <History className="h-3 w-3" /> Mis Creaciones Mágicas
                        </div>
                        {magicHistory.length > 3 && (
                          <div className="relative w-40">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                            <Input
                              placeholder="Filtrar..."
                              value={historySearchQuery}
                              onChange={(e) => setHistorySearchQuery(e.target.value)}
                              className="h-7 pl-7 text-[10px] bg-slate-900 border-white/5 focus:border-amber-500/50"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="max-h-[280px] overflow-y-auto pr-2 space-y-2 custom-scrollbar transition-all">
                        {(() => {
                          const filtered = magicHistory.filter(q => 
                            q.title.toLowerCase().includes(historySearchQuery.toLowerCase())
                          );
                          
                          if (filtered.length > 0) {
                            return filtered.map((quiz) => (
                              <button
                                key={quiz.id}
                                onClick={() => {
                                  onClose();
                                  setLocation(`/quiz/${quiz.id}`);
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                    <Wand2 className="h-4 w-4 text-amber-500/70" />
                                  </div>
                                  <div className="truncate">
                                    <h5 className="font-bold text-xs text-slate-200 truncate group-hover:text-amber-400 transition-colors">{quiz.title}</h5>
                                    <p className="text-[10px] text-slate-500">{quiz.difficulty || 'Media'} • {quiz.totalQuestions} preguntas</p>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-amber-500 transition-colors" />
                              </button>
                            ));
                          }
                          
                          if (magicHistory.length > 0 && filtered.length === 0) {
                            return (
                              <div className="text-center py-8 text-slate-500 text-[10px] italic">
                                No se encontraron cuestionarios con ese nombre.
                              </div>
                            );
                          }
                          
                          return (
                            <div className="text-center py-8 rounded-xl border border-dashed border-white/10 text-slate-500 text-xs mt-2">
                              Aún no has creado cuestionarios con IA.
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                {/* Materia y Subtema */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-amber-200/80">Materia</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val, subcategoryId: "all" })}
                    >
                      <SelectTrigger id="category" className="bg-slate-900 border-slate-800">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory" className="text-amber-200/80">Subtema (Opcional)</Label>
                    <Select
                      value={formData.subcategoryId}
                      onValueChange={(val) => setFormData({ ...formData, subcategoryId: val })}
                      disabled={!formData.categoryId || loadingSubcategories}
                    >
                      <SelectTrigger id="subcategory" className="bg-slate-900 border-slate-800">
                        <SelectValue placeholder={loadingSubcategories ? "Cargando..." : "Todos"} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="all">Todos los temas</SelectItem>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Descripción del tema */}
                <div className="space-y-3">
                  <Label htmlFor="topic" className="text-amber-200/80">
                    Describe brevemente el cuestionario que deseas
                  </Label>
                  <Textarea
                    id="topic"
                    placeholder="Ej: Quiero un cuestionario para practicar ecuaciones de primer grado..."
                    className="bg-slate-900 border-slate-800 focus:border-amber-500/50 min-h-[100px] resize-none text-sm"
                    value={formData.topicDescription}
                    onChange={(e) => setFormData({ ...formData, topicDescription: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    Sé específico para obtener mejores resultados. La IA diseñará las preguntas basándose en tu descripción.
                  </p>
                </div>

                {/* Preguntas y Tiempo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-amber-200/80">Preguntas</Label>
                      <span className="text-xs font-bold text-amber-400">{formData.questionCount}</span>
                    </div>
                    <Slider
                      value={[formData.questionCount]}
                      min={5}
                      max={12}
                      step={1}
                      onValueChange={([val]) => setFormData({ ...formData, questionCount: val })}
                      className="py-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-amber-200/80">Tiempo (Minutos)</Label>
                    <Select
                      value={formData.timeLimit.toString()}
                      onValueChange={(val) => setFormData({ ...formData, timeLimit: parseInt(val) })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="10">10 Min</SelectItem>
                        <SelectItem value="15">15 Min</SelectItem>
                        <SelectItem value="20">20 Min</SelectItem>
                        <SelectItem value="30">30 Min</SelectItem>
                        <SelectItem value="45">45 Min</SelectItem>
                        <SelectItem value="60">60 Min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dificultad */}
                <div className="space-y-2">
                  <Label className="text-amber-200/80">Dificultad</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                          formData.difficulty === diff
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Media' : 'Difícil'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Costo */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    <span>Costo: <span className="text-white font-bold">10 créditos</span></span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Tienes: <span className={credits >= 10 ? 'text-emerald-400' : 'text-red-400'}>{credits} créditos</span>
                  </div>
                </div>
              </motion.div>
            )
          ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative h-24 w-24 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin flex items-center justify-center" />
                  <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-amber-400 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-amber-400">Invocando Conocimiento...</h3>
                  <p className="text-sm text-slate-400 italic">"La IA está diseñando un desafío único para ti"</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Zap className="h-3 w-3 text-amber-500" /> Generando preguntas
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Brain className="h-3 w-3 text-purple-500" /> Creando respuestas
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="h-3 w-3 text-blue-500" /> Ajustando tiempo
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="relative z-10 border-t border-white/5 p-6 bg-slate-900/30">
          <Button
            variant="ghost"
            onClick={step === 1 ? () => setStep(0) : onClose}
            disabled={isGenerating}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            {step === 1 ? "Atrás" : "Cerrar"}
          </Button>

          {step === 1 && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (credits < 10 && userRole !== 'admin')}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-501 hover:to-amber-500 text-white font-bold shadow-lg shadow-amber-500/20 px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  ¡Hacer Magia!
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
