import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout } from "@/components/layout/page-layout";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Trash, Plus, Minus, Edit, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Definimos los tipos necesarios
interface Category {
  id: number;
  name: string;
}

interface Quiz {
  id: number;
  title: string;
  categoryId: number;
}

interface Answer {
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

// Schema para el formulario de creación de preguntas
const formSchema = z.object({
  quizId: z.string(),
  content: z.string().min(5, "El contenido debe tener al menos 5 caracteres"),
  type: z.string(),
  difficulty: z.string().transform(val => parseInt(val)),
  points: z.string().transform(val => parseInt(val)),
  variables: z.string().optional(),
  answers: z.array(
    z.object({
      content: z.string().min(1, "La respuesta no puede estar vacía"),
      isCorrect: z.boolean(),
      explanation: z.string().optional()
    })
  ).min(2, "Debe haber al menos 2 opciones de respuesta"),
});

export default function QuestionsAdmin() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("create");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [answers, setAnswers] = useState<Answer[]>([
    { content: "", isCorrect: true, explanation: "" },
    { content: "", isCorrect: false, explanation: "" },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Consultas para obtener datos
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: quizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    enabled: !!categories,
  });

  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions } = useQuery({
    queryKey: ["/api/admin/questions", selectedQuiz],
    enabled: selectedQuiz !== "",
  });

  // Configuración del formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizId: "",
      content: "",
      type: "multiple_choice",
      difficulty: "1",
      points: "5",
      variables: "",
      answers: [
        { content: "", isCorrect: true, explanation: "" },
        { content: "", isCorrect: false, explanation: "" },
      ],
    },
  });

  // Mutaciones para CRUD de preguntas
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest("/api/admin/questions", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          variables: values.variables ? JSON.parse(values.variables) : null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions", selectedQuiz] });
      form.reset({
        quizId: selectedQuiz,
        content: "",
        type: "multiple_choice",
        difficulty: "1",
        points: "5",
        variables: "",
        answers: [
          { content: "", isCorrect: true, explanation: "" },
          { content: "", isCorrect: false, explanation: "" },
        ],
      });
      setAnswers([
        { content: "", isCorrect: true, explanation: "" },
        { content: "", isCorrect: false, explanation: "" },
      ]);
      toast({
        title: "Pregunta creada",
        description: "La pregunta ha sido creada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la pregunta",
        variant: "destructive",
      });
      console.error("Error al crear la pregunta:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions", selectedQuiz] });
      toast({
        title: "Pregunta eliminada",
        description: "La pregunta ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la pregunta",
        variant: "destructive",
      });
      console.error("Error al eliminar la pregunta:", error);
    },
  });

  // Funciones de manejo
  function addAnswer() {
    setAnswers([...answers, { content: "", isCorrect: false, explanation: "" }]);
    form.setValue("answers", [...answers, { content: "", isCorrect: false, explanation: "" }]);
  }

  function removeAnswer(index: number) {
    if (answers.length <= 2) {
      toast({
        title: "Error",
        description: "Debe haber al menos 2 opciones de respuesta",
        variant: "destructive",
      });
      return;
    }
    
    const newAnswers = [...answers];
    newAnswers.splice(index, 1);
    setAnswers(newAnswers);
    form.setValue("answers", newAnswers);
  }

  function updateAnswer(index: number, key: keyof Answer, value: any) {
    const newAnswers = [...answers];
    
    // Si estamos cambiando isCorrect a true, ponemos las demás en false para preguntas tipo radio
    if (key === "isCorrect" && value === true && form.getValues("type") === "multiple_choice") {
      newAnswers.forEach((answer, i) => {
        if (i !== index) {
          newAnswers[i].isCorrect = false;
        }
      });
    }
    
    newAnswers[index][key] = value;
    setAnswers(newAnswers);
    form.setValue("answers", newAnswers);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Verificar si hay al menos una respuesta correcta
    const hasCorrectAnswer = values.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      toast({
        title: "Error",
        description: "Debe haber al menos una respuesta correcta",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Si hay variables, validar que sean JSON válido
      if (values.variables) {
        JSON.parse(values.variables);
      }
      
      createMutation.mutate(values);
    } catch (error) {
      toast({
        title: "Error en formato JSON",
        description: "El formato de las variables no es un JSON válido",
        variant: "destructive",
      });
    }
  }

  function handleQuizChange(value: string) {
    setSelectedQuiz(value);
    form.setValue("quizId", value);
  }

  function handleDelete(id: number) {
    if (window.confirm("¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Preguntas</h1>
        
        <Tabs defaultValue="create" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Crear Pregunta</TabsTrigger>
            <TabsTrigger value="list">Ver Preguntas</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <div className="mb-6">
              <FormLabel className="text-base">Selecciona un cuestionario</FormLabel>
              <Select value={selectedQuiz} onValueChange={handleQuizChange}>
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="Selecciona un cuestionario" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes?.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id.toString()}>
                      {quiz.title} - {categories?.find(c => c.id === quiz.categoryId)?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="create" className="mt-4">
            {selectedQuiz ? (
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Pregunta</CardTitle>
                  <CardDescription>
                    Crea una nueva pregunta para el cuestionario seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contenido de la pregunta</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Escribe aquí el enunciado de la pregunta. Usa {variable} para valores dinámicos." 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tipo de pregunta" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                                  <SelectItem value="checkbox">Selección múltiple</SelectItem>
                                  <SelectItem value="equation">Ecuación</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dificultad</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Nivel de dificultad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - Fácil</SelectItem>
                                  <SelectItem value="2">2 - Moderado</SelectItem>
                                  <SelectItem value="3">3 - Intermedio</SelectItem>
                                  <SelectItem value="4">4 - Desafiante</SelectItem>
                                  <SelectItem value="5">5 - Difícil</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="points"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Puntos</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Puntos por respuesta correcta" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 punto</SelectItem>
                                  <SelectItem value="2">2 puntos</SelectItem>
                                  <SelectItem value="5">5 puntos</SelectItem>
                                  <SelectItem value="10">10 puntos</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="variables"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variables (JSON)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder='{"a": {"min": 1, "max": 10}, "b": {"min": 5, "max": 20}}' 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-muted-foreground mt-1">
                              Define variables para generar valores aleatorios. Usa formato JSON como en el ejemplo.
                            </p>
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel className="text-base">Respuestas</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addAnswer}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Añadir respuesta
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {answers.map((answer, index) => (
                            <Card key={index}>
                              <CardContent className="pt-4 pb-3">
                                <div className="flex gap-3 items-start">
                                  <div className="flex-grow">
                                    <FormItem className="mb-2">
                                      <FormLabel>Contenido</FormLabel>
                                      <FormControl>
                                        <Input 
                                          value={answer.content}
                                          onChange={(e) => updateAnswer(index, "content", e.target.value)}
                                          placeholder="Escribe la respuesta"
                                        />
                                      </FormControl>
                                    </FormItem>
                                    
                                    <FormItem>
                                      <FormLabel>Explicación (opcional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          value={answer.explanation || ""}
                                          onChange={(e) => updateAnswer(index, "explanation", e.target.value)}
                                          placeholder="Explica por qué esta respuesta es correcta/incorrecta"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  </div>
                                  
                                  <div className="flex flex-col items-center space-y-3 pt-8">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={answer.isCorrect}
                                        onCheckedChange={(checked) => updateAnswer(index, "isCorrect", checked)}
                                      />
                                      <span className="text-sm">
                                        {answer.isCorrect ? "Correcta" : "Incorrecta"}
                                      </span>
                                    </div>
                                    
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeAnswer(index)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                          Crear Pregunta
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Selecciona un cuestionario</h3>
                  <p className="text-muted-foreground">
                    Por favor, selecciona un cuestionario para comenzar a crear preguntas.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            {selectedQuiz ? (
              <Card>
                <CardHeader>
                  <CardTitle>Preguntas del Cuestionario</CardTitle>
                  <CardDescription>
                    Listado de todas las preguntas para el cuestionario seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner className="h-8 w-8" />
                    </div>
                  ) : questions && questions.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {questions.map((question: any) => (
                          <Card key={question.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                  <div className="flex gap-2 mb-2">
                                    <Badge variant="outline">Tipo: {question.type}</Badge>
                                    <Badge variant="outline">Dificultad: {question.difficulty}</Badge>
                                    <Badge variant="outline">Puntos: {question.points}</Badge>
                                  </div>
                                  <p className="text-base font-medium mb-3">{question.content}</p>
                                  
                                  <Separator className="my-3" />
                                  
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Respuestas:</h4>
                                    {question.answers && question.answers.map((answer: any) => (
                                      <div 
                                        key={answer.id} 
                                        className={`p-2 rounded-md ${answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {answer.isCorrect ? 
                                            <Check className="h-4 w-4 text-green-600" /> : 
                                            <X className="h-4 w-4 text-red-600" />
                                          }
                                          <span>{answer.content}</span>
                                        </div>
                                        {answer.explanation && (
                                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                                            {answer.explanation}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDelete(question.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium mb-2">No hay preguntas</h3>
                      <p className="text-muted-foreground mb-4">
                        Este cuestionario aún no tiene preguntas.
                      </p>
                      <Button onClick={() => setSelectedTab("create")}>
                        Crear primera pregunta
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total: {questions?.length || 0} preguntas
                  </p>
                  <Button variant="outline" onClick={() => refetchQuestions()}>
                    Actualizar
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Selecciona un cuestionario</h3>
                  <p className="text-muted-foreground">
                    Por favor, selecciona un cuestionario para ver sus preguntas.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}