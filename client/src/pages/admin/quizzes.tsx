import React, { useEffect, useState } from "react"; // asegúrate de importar useState y useEffect aquí
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
import { Trash, Clock, BookOpen, Link as LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Category, Quiz } from "@/shared/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { User } from '@/shared/types';

//deep seek me ayuda a organizar categorías y cuestionarios
//import React, { useEffect } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
//fin deep seek


const difficultyOptions = [
  { value: "básico", label: "Básico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const formSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  categoryId: z.string().min(1, { message: "Debes seleccionar una categoría" }),
  timeLimit: z.string().min(1, { message: "Debes establecer un tiempo límite" }),
  difficulty: z.string().min(1, { message: "Debes seleccionar una dificultad" }),
  isPublic: z.boolean().default(false),
});

export default function QuizzesAdmin() {

//chat gpt quiz a usuario
// Agrega esto donde estás mostrando cada quiz

const [assignedUsers, setAssignedUsers] = useState<number[]>([]); // Para los usuarios asignados
const [visibleQuizId, setVisibleQuizId] = useState<number | null>(null); // Para mostrar los usuarios de un quiz específico
const [allUsers, setAllUsers] = useState<User[]>([]); // Lista de todos los usuarios

useEffect(() => {
  // Cargar todos los usuarios (solo una vez)
  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setAllUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  loadUsers();
}, []);


const fetchUsers = async () => {
  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    console.log("Usuarios recibidos (todos):", data);
    if (Array.isArray(data)) {
      setAllUsers(data);
    } else {
      console.warn("Respuesta inesperada en fetchUsers:", data);
      setAllUsers([]);
    }
  } catch (err) {
    console.error("Error en fetchUsers:", err);
    setAllUsers([]);
  }
};

const fetchAssignedUsers = async (quizId: number) => {
  try {
    const res = await fetch(`/api/admin/users/quizzes/${quizId}`);
    if (!res.ok) {
      console.error("Error fetching assigned users:", res.status);
      return;
    }
    const data = await res.json(); // ← Aquí debe venir como array de usuarios o de objetos con user.id
    console.log("📥 Usuarios asignados recibidos:", data);
    setAssignedUsers(data.map((user: any) => user.userId ?? user.id)); // por si devuelve {userId: X}//esto soluciono el problema de los checkboxes chat gpt genial
  } catch (error) {
    console.error("Error in fetchAssignedUsers:", error);
  }
};


const toggleQuizAssignment = async (
  quizId: number,
  userId: number,
  isAssigned: boolean
) => {
  const method = isAssigned ? "DELETE" : "POST"; // Si ya está asignado, elimina; si no, asigna
  try {
    const res = await fetch(`/api/admin/users/quizzes`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, quizId }),
    });

    if (res.ok) {
      fetchAssignedUsers(quizId); // Refresca la lista de usuarios asignados
    } else {
      console.error("Error in toggleQuizAssignment:", res.status);
    }
  } catch (error) {
    console.error("Error in toggleQuizAssignment:", error);
  }
};



useEffect(() => {
  fetchUsers();
}, []);
//chat gpt quiz a usuario fin

  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const isLoading = loadingCategories || loadingQuizzes;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      timeLimit: "300",
      difficulty: "intermedio",
      isPublic: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        ...values,
        categoryId: parseInt(values.categoryId),
        timeLimit: parseInt(values.timeLimit),
        totalQuestions: 0, // Se actualizará cuando se añadan preguntas
      };
      
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear el cuestionario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      form.reset({
        title: "",
        description: "",
        categoryId: "",
        timeLimit: "300",
        difficulty: "intermedio",
        isPublic: false,
      });
      toast({
        title: "Cuestionario creado",
        description: "El cuestionario ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el cuestionario",
        variant: "destructive",
      });
      console.error("Error al crear el cuestionario:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema> & { id: number }) => {
      const payload = {
        ...values,
        categoryId: parseInt(values.categoryId),
        timeLimit: parseInt(values.timeLimit),
      };
      
      const response = await fetch(`/api/admin/quizzes/${values.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar el cuestionario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      setEditingId(null);
      form.reset({
        title: "",
        description: "",
        categoryId: "",
        timeLimit: "300",
        difficulty: "intermedio",
        isPublic: false,
      });
      toast({
        title: "Cuestionario actualizado",
        description: "El cuestionario ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cuestionario",
        variant: "destructive",
      });
      console.error("Error al actualizar el cuestionario:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/quizzes/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el cuestionario");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Cuestionario eliminado",
        description: "El cuestionario ha sido eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cuestionario",
        variant: "destructive",
      });
      console.error("Error al eliminar el cuestionario:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingId) {
      updateMutation.mutate({ ...values, id: editingId });
    } else {
      createMutation.mutate(values);
    }
  }

  function handleEdit(quiz: Quiz) {
    setEditingId(quiz.id);
    form.reset({
      title: quiz.title,
      description: quiz.description,
      categoryId: String(quiz.categoryId),
      timeLimit: String(quiz.timeLimit),
      difficulty: quiz.difficulty,
      isPublic: quiz.isPublic === true,
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      categoryId: "",
      timeLimit: "300",
      difficulty: "intermedio",
      isPublic: false,
    });
  }

  function handleDelete(id: number) {
    if (window.confirm("¿Estás seguro de eliminar este cuestionario? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  }
  
  function handleManageQuestions(quizId: number) {
    window.location.href = `/admin/quizzes/${quizId}/questions`;
  }

  function getCategoryName(categoryId: number): string {
    if (!categories) return "";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "";
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Administración de Cuestionarios</h1>
          <p className="text-muted-foreground">Gestiona los cuestionarios y sus preguntas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="bg-muted/50">
              <CardTitle>{editingId ? "Editar Cuestionario" : "Nuevo Cuestionario"}</CardTitle>
              <CardDescription>
                {editingId 
                  ? "Actualiza los detalles del cuestionario" 
                  : "Añade un nuevo cuestionario al sistema"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Álgebra Básica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe brevemente de qué trata este cuestionario" 
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
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiempo límite (segundos)</FormLabel>
                          <FormControl>
                            <Input type="number" min="30" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {parseInt(field.value) > 0 ? `${Math.floor(parseInt(field.value) / 60)} min ${parseInt(field.value) % 60} seg` : ""}
                          </FormDescription>
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona dificultad" />
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
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Disponible públicamente</FormLabel>
                          <FormDescription>
                            Estará visible sin necesidad de registro
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) && <Spinner className="mr-2 h-4 w-4" />}
                      {editingId ? "Actualizar" : "Crear cuestionario"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle>Cuestionarios Existentes</CardTitle>
              <CardDescription>
                Lista de todos los cuestionarios disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <>
                {categories && categories.length > 0 ? (
                <Accordion type="multiple" className="space-y-4">
                  {categories.map((category) => {
                    const categoryQuizzes = quizzes.filter(quiz => quiz.categoryId === category.id);
      if (categoryQuizzes.length === 0) return null;
      
      return (
        <AccordionItem 
          key={category.id} 
          value={category.id.toString()}
          className={`border rounded-md overflow-hidden ${category.colorClass ? `border-l-4 border-l-${category.colorClass}` : ''}`}
        >
          <AccordionTrigger className="hover:no-underline px-4 py-3">
            <div className="flex-1 text-left">
              <h3 className="text-lg font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-0">
            <div className="grid grid-cols-1 gap-4 pt-4">
              {categoryQuizzes.map((quiz: Quiz) => (
                <Card key={quiz.id} className="overflow-hidden border border-muted">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                            {quiz.isPublic && (
                              <Badge variant="outline" className="ml-2">
                                <LinkIcon className="h-3 w-3 mr-1" /> Público
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(quiz)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(quiz.id)}
                            title="Eliminar cuestionario"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>                    
  <Button
  size="sm"
  variant="secondary"
  onClick={() => {
    setVisibleQuizId(quiz.id);
    fetchAssignedUsers(quiz.id);
  }}
>
  Asignar usuarios
</Button>

{visibleQuizId === quiz.id && (
  <div className="mt-4">
    <p className="font-semibold">Usuarios asignados:</p>
    <ul className="list-disc ml-6">
      {allUsers.map((user) => (
        <li key={user.id}>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={assignedUsers.includes(user.id)} // Marca el checkbox si el usuario está asignado
              onChange={() =>
                toggleQuizAssignment(
                  quiz.id,
                  user.id,
                  assignedUsers.includes(user.id) // Si está asignado, elimina; si no, asigna
                )
              }
            />
            {user.name} ({user.email})
          </label>
        </li>
      ))}
    </ul>
  </div>
)}


                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div>
                          <Badge variant={
                            quiz.difficulty === "básico" ? "default" : 
                            quiz.difficulty === "intermedio" ? "secondary" : "destructive"
                          }>
                            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant="outline" className="bg-primary/10">
                            {quiz.totalQuestions} {quiz.totalQuestions === 1 ? "pregunta" : "preguntas"}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleManageQuestions(quiz.id)}
                        >
                          Gestionar preguntas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    })}
    
    {/* Cuestionarios sin categoría */}
    {quizzes.filter(quiz => !categories.some(cat => cat.id === quiz.categoryId)).length > 0 && (
      <AccordionItem value="uncategorized" className="border rounded-md overflow-hidden">
        <AccordionTrigger className="hover:no-underline px-4 py-3">
          <div className="flex-1 text-left">
            <h3 className="text-lg font-medium">Sin categoría</h3>
            <p className="text-sm text-muted-foreground">Cuestionarios que no pertenecen a ninguna categoría</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-0">
          <div className="grid grid-cols-1 gap-4 pt-4">
            {quizzes
              .filter(quiz => !categories.some(cat => cat.id === quiz.categoryId))
              .map((quiz: Quiz) => (
                <Card key={quiz.id} className="overflow-hidden border border-muted">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                            {quiz.isPublic && (
                              <Badge variant="outline" className="ml-2">
                                <LinkIcon className="h-3 w-3 mr-1" /> Público
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(quiz)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(quiz.id)}
                            title="Eliminar cuestionario"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div>
                          <Badge variant={
                            quiz.difficulty === "básico" ? "default" : 
                            quiz.difficulty === "intermedio" ? "secondary" : "destructive"
                          }>
                            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant="outline" className="bg-primary/10">
                            {quiz.totalQuestions} {quiz.totalQuestions === 1 ? "pregunta" : "preguntas"}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleManageQuestions(quiz.id)}
                        >
                          Gestionar preguntas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    )}
  </Accordion>
) : (
  
                    <div className="grid grid-cols-1 gap-4">
                      {quizzes.map((quiz: Quiz) => (
                        <Card key={quiz.id} className="overflow-hidden border border-muted">
                          <CardContent className="p-6">
                            <div className="flex flex-col space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                                    {quiz.isPublic && (
                                      <Badge variant="outline" className="ml-2">
                                        <LinkIcon className="h-3 w-3 mr-1" /> Público
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEdit(quiz)}
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDelete(quiz.id)}
                                    title="Eliminar cuestionario"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                                  <span>{getCategoryName(quiz.categoryId)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                  <span>{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <div>
                                  <Badge variant={
                                    quiz.difficulty === "básico" ? "default" : 
                                    quiz.difficulty === "intermedio" ? "secondary" : "destructive"
                                  }>
                                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                                  </Badge>
                                </div>
                                <div>
                                  <Badge variant="outline" className="bg-primary/10">
                                    {quiz.totalQuestions} {quiz.totalQuestions === 1 ? "pregunta" : "preguntas"}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="flex justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleManageQuestions(quiz.id)}
                                >
                                  Gestionar preguntas
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mb-4 rounded-full bg-muted h-12 w-12 flex items-center justify-center mx-auto">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No hay cuestionarios disponibles</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crea tu primer cuestionario para empezar a configurar preguntas.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-3">
              <p className="text-sm text-muted-foreground">
                Total: <strong>{quizzes?.length || 0}</strong> cuestionarios
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}