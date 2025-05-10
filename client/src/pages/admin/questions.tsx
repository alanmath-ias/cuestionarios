import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Trash, Plus, Check, X, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Question, Answer, Quiz } from "@/shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoute } from "wouter";

const questionTypeOptions = [
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "text", label: "Texto libre" },
  { value: "formula", label: "Fórmula matemática" },
];

const difficultyOptions = [
  { value: "1", label: "Muy fácil" },
  { value: "2", label: "Fácil" },
  { value: "3", label: "Intermedio" },
  { value: "4", label: "Difícil" },
  { value: "5", label: "Muy difícil" },
];

const formSchema = z.object({
  content: z.string().min(3, { message: "La pregunta debe tener al menos 3 caracteres" }),
  type: z.string().min(1, { message: "Debes seleccionar un tipo de pregunta" }),
  difficulty: z.string().min(1, { message: "Debes seleccionar una dificultad" }),
  points: z.string().min(1, { message: "Debes asignar puntos a la pregunta" }),
  variables: z.string().optional(),
  imageUrl: z.string().optional().refine(
    val => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Debe ser una URL válida" }
  ),
});

export default function QuestionsAdmin() {
  const { toast } = useToast();
  const [, params] = useRoute("/admin/quizzes/:quizId/questions");
  const quizId = params?.quizId;
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState({ content: "", isCorrect: false, explanation: "" });
  const [currentTab, setCurrentTab] = useState("question");

  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !!quizId,
  });

  const { data: questions, isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
    enabled: !!quizId,
  });

  const isLoading = loadingQuiz || loadingQuestions;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      type: "multiple_choice",
      difficulty: "3",
      points: "10",
      variables: "",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        quizId: quizId,
        content: values.content,
        type: values.type,
        difficulty: parseInt(values.difficulty),
        points: parseInt(values.points),
        variables: values.variables ? JSON.parse(values.variables) : null,
        answers: values.type === 'multiple_choice' ? answers : [],
        imageUrl: values.imageUrl || null,
      };
      
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Error al crear la pregunta");
      }
      
      return response.json();
    },
    onSuccess: (data: Question) => {
      if (answers.length > 0) {
        Promise.all(
          answers.map(answer => 
            fetch("/api/admin/answers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...answer,
                questionId: data.id
              })
            })
          )
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}/questions`] });
          resetFormAndState();
          toast({
            title: "Pregunta creada",
            description: "La pregunta y sus respuestas han sido creadas exitosamente",
          });
        }).catch(() => {
          toast({
            title: "Error",
            description: "La pregunta se creó pero hubo un problema con las respuestas",
            variant: "destructive",
          });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}/questions`] });
        resetFormAndState();
        toast({
          title: "Pregunta creada",
          description: "La pregunta ha sido creada exitosamente",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la pregunta",
        variant: "destructive",
      });
      console.error("Error al crear la pregunta:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar la pregunta");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}/questions`] });
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

  const resetFormAndState = () => {
    setEditingId(null);
    setAnswers([]);
    setNewAnswer({ content: "", isCorrect: false, explanation: "" });
    setCurrentTab("question");
    form.reset({
      content: "",
      type: "multiple_choice",
      difficulty: "3",
      points: "10",
      variables: "",
      imageUrl: "",
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (form.watch("type") === "multiple_choice" && answers.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos una respuesta para preguntas de opción múltiple",
        variant: "destructive",
      });
      setCurrentTab("answers");
      return;
    }

    if (form.watch("type") === "multiple_choice" && !answers.some(a => a.isCorrect)) {
      toast({
        title: "Error",
        description: "Debe haber al menos una respuesta correcta",
        variant: "destructive",
      });
      setCurrentTab("answers");
      return;
    }

    if (editingId) {
      toast({
        title: "Funcionalidad no disponible",
        description: "La edición de preguntas estará disponible próximamente",
        variant: "destructive",
      });
    } else {
      createMutation.mutate(values);
    }
  }

  function handleAddAnswer() {
    if (!newAnswer.content.trim()) {
      toast({
        title: "Error",
        description: "El contenido de la respuesta no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    setAnswers([...answers, { 
      ...newAnswer, 
      id: Math.floor(Math.random() * -1000),
      questionId: editingId || 0
    }]);
    setNewAnswer({ content: "", isCorrect: false, explanation: "" });
  }

  function handleRemoveAnswer(index: number) {
    setAnswers(answers.filter((_, i) => i !== index));
  }

  function handleDelete(id: number) {
    if (window.confirm("¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  }

  function getQuestionTypeName(type: string): string {
    const option = questionTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  function getDifficultyName(level: number): string {
    const option = difficultyOptions.find(opt => opt.value === String(level));
    return option ? option.label : String(level);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Preguntas</h1>
          <p className="text-muted-foreground">
            {quiz ? `Editando: ${quiz.title}` : "Cargando información..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/admin/quizzes"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cuestionarios
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="bg-muted/50">
              <CardTitle>{editingId ? "Editar Pregunta" : "Nueva Pregunta"}</CardTitle>
              <CardDescription>
                {editingId 
                  ? "Actualiza los detalles de la pregunta" 
                  : "Añade una nueva pregunta al cuestionario"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="question">Pregunta</TabsTrigger>
                  <TabsTrigger value="answers" disabled={form.watch("type") !== "multiple_choice"}>
                    Respuestas
                    {form.watch("type") === "multiple_choice" && (
                      <Badge variant="outline" className="ml-2">{answers.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="question" className="pt-4">
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enunciado de la pregunta</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Escribe aquí el enunciado de la pregunta..." 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de la imagen (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="https://ejemplo.com/imagen.png"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de pregunta</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== "multiple_choice") {
                                  setAnswers([]);
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {questionTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            {field.value === "formula" && (
                              <FormDescription>
                                Las preguntas de fórmula permiten generar variables aleatorias
                              </FormDescription>
                            )}
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dificultad</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Nivel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {difficultyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
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
                              <FormControl>
                                <Input type="number" min="1" max="100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {form.watch("type") === "formula" && (
                        <FormField
                          control={form.control}
                          name="variables"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variables (JSON)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='{"a": {"min": 1, "max": 10}, "b": {"min": 1, "max": 5}}'
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Define las variables y sus rangos en formato JSON
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {form.watch("type") === "multiple_choice" && (
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentTab("answers")}
                          >
                            Configurar respuestas
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="answers" className="pt-4">
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <h3 className="font-medium mb-3">Añadir respuesta</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Contenido</label>
                          <Input
                            value={newAnswer.content}
                            onChange={(e) => setNewAnswer({ ...newAnswer, content: e.target.value })}
                            placeholder="Escribe aquí la respuesta..."
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is-correct"
                            checked={newAnswer.isCorrect}
                            onCheckedChange={(checked) => setNewAnswer({ ...newAnswer, isCorrect: !!checked })}
                          />
                          <label
                            htmlFor="is-correct"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Respuesta correcta
                          </label>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Explicación (opcional)</label>
                          <Textarea
                            value={newAnswer.explanation || ""}
                            onChange={(e) => setNewAnswer({ ...newAnswer, explanation: e.target.value })}
                            placeholder="Explica por qué esta respuesta es correcta o incorrecta..."
                            rows={2}
                          />
                        </div>
                        
                        <Button
                          type="button"
                          onClick={handleAddAnswer}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir respuesta
                        </Button>
                      </div>
                    </div>
                    
                    {answers.length > 0 ? (
                      <div>
                        <h3 className="font-medium mb-2">Respuestas configuradas</h3>
                        <div className="space-y-2">
                          {answers.map((answer, index) => (
                            <div key={index} className="flex items-start justify-between bg-background border rounded-md p-3">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  {answer.isCorrect ? (
                                    <Badge variant="success" className="mr-2">
                                      <Check className="h-3 w-3 mr-1" />
                                      Correcta
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="mr-2">
                                      <X className="h-3 w-3 mr-1" />
                                      Incorrecta
                                    </Badge>
                                  )}
                                  <span className="font-medium">{answer.content}</span>
                                </div>
                                {answer.explanation && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Explicación: {answer.explanation}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAnswer(index)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">No hay respuestas configuradas</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab("question")}
                      >
                        Volver a la pregunta
                      </Button>
                      <div>
                        {answers.length > 0 && !answers.some(a => a.isCorrect) && (
                          <p className="text-xs text-destructive mb-2">
                            Debe haber al menos una respuesta correcta
                          </p>
                        )}
                        <Button
                          type="button"
                          disabled={createMutation.isPending || answers.length === 0}
                          onClick={() => form.handleSubmit(onSubmit)()}
                        >
                          {createMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                          Guardar pregunta
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {currentTab === "question" && (
                <div className="flex justify-end gap-2 pt-4">
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetFormAndState}
                    >
                      Cancelar
                    </Button>
                  )}
                  {form.watch("type") !== "multiple_choice" && (
                    <Button 
                      type="button" 
                      disabled={createMutation.isPending}
                      onClick={() => form.handleSubmit(onSubmit)()}
                    >
                      {createMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                      {editingId ? "Actualizar" : "Guardar pregunta"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle>Preguntas Existentes</CardTitle>
              <CardDescription>
                Lista de todas las preguntas en este cuestionario
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : questions && questions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {questions.map((question: Question) => (
                    <Card key={question.id} className="overflow-hidden border border-muted">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{getQuestionTypeName(question.type)}</Badge>
                              <Badge variant="secondary">{getDifficultyName(question.difficulty)}</Badge>
                              <Badge variant="default">{question.points} puntos</Badge>
                            </div>
                            <p className="font-medium">{question.content}</p>
                            {question.imageUrl && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Imagen:</strong> {question.imageUrl}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(question.id)}
                              title="Eliminar pregunta"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mb-4 rounded-full bg-muted h-12 w-12 flex items-center justify-center mx-auto">
                    <Trash className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No hay preguntas disponibles</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Añade tu primera pregunta para completar el cuestionario.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-3">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-muted-foreground">
                  Total: <strong>{questions?.length || 0}</strong> preguntas
                </p>
                {(questions?.length || 0) > 0 && (
                  <Button size="sm" variant="outline" onClick={() => window.location.href = `/quiz/${quizId}`}>
                    Ver cuestionario
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}