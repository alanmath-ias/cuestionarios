import React, { useEffect, useState } from "react";
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
import { Category, Quiz, Subcategory, User } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const difficultyOptions = [
  { value: "básico", label: "Básico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const formSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  categoryId: z.string().min(1, { message: "Debes seleccionar una materia" }),
  subcategoryId: z.string().min(1, { message: "Debes seleccionar un tema" }),
  timeLimit: z.string().min(1, { message: "Debes establecer un tiempo límite" }),
  difficulty: z.string().min(1, { message: "Debes seleccionar una dificultad" }),
  isPublic: z.boolean().default(false),
});

export default function QuizzesAdmin() {
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [visibleQuizId, setVisibleQuizId] = useState<number | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);

  // Queries
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: subcategoriesResponse, isLoading: loadingSubcategoriesList } = useQuery<Subcategory[]>({
    queryKey: ["/api/admin/subcategories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/subcategories");
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    }
  });

  const isLoading = loadingCategories || loadingQuizzes || loadingSubcategoriesList;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      subcategoryId: "",
      timeLimit: "300",
      difficulty: "intermedio",
      isPublic: false,
    },
  });

  const categoryId = form.watch("categoryId");

  // Effects
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) {
        form.setValue("subcategoryId", "");
        return;
      }

      setLoadingSubcategories(true);
      try {
        const res = await fetch(`/api/admin/subcategories/by-category/${categoryId}`);
        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Formato de datos inválido");
        }

        if (editingId && form.getValues("subcategoryId")) {
          const currentSub = data.find((sub: any) => sub.id === Number(form.getValues("subcategoryId")));
          if (!currentSub) {
            form.setValue("subcategoryId", "");
          }
        } else {
          form.setValue("subcategoryId", "");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los Temas",
          variant: "destructive",
        });
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [categoryId, editingId, form, toast]);

  useEffect(() => {
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

  // Helper functions
  const organizeQuizzesHierarchically = () => {
    if (!quizzes || !categories || !subcategoriesResponse) return [];

    const quizzesBySubcategory = quizzes.reduce((acc, quiz) => {
      const subcatId = quiz.subcategoryId;
      if (!subcatId) return acc;

      if (!acc[subcatId]) {
        acc[subcatId] = [];
      }
      acc[subcatId].push(quiz);
      return acc;
    }, {} as Record<number, Quiz[]>);

    const result = categories.map(category => {
      const categorySubcategories = subcategoriesResponse
        .filter((sub: any) => sub.categoryId === category.id)
        .map((sub: any) => ({
          ...sub,
          quizzes: quizzesBySubcategory[sub.id] || []
        }));

      return {
        ...category,
        subcategories: categorySubcategories
      };
    });

    return result;
  };

  const hierarchicalData = organizeQuizzesHierarchically();
  const quizzesWithoutClassification = quizzes?.filter(q => !q.categoryId || !q.subcategoryId) || [];

  // Async functions
  const fetchAssignedUsers = async (quizId: number) => {
    try {
      const res = await fetch(`/api/admin/users/quizzes/${quizId}`);
      if (!res.ok) {
        console.error("Error fetching assigned users:", res.status);
        return;
      }
      const data = await res.json();
      setAssignedUsers(data.map((user: any) => user.userId ?? user.id));
    } catch (error) {
      console.error("Error in fetchAssignedUsers:", error);
    }
  };

  const toggleQuizAssignment = async (
    quizId: number,
    userId: number,
    isAssigned: boolean
  ) => {
    try {
      let url = "/api/admin/users/quizzes";
      let method = "DELETE";
      let body: any = { userId, quizId };

      if (!isAssigned) {
        url = `/api/admin/users/${userId}/quizzes`;
        method = "POST";
        body = { quizIds: [quizId] };
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchAssignedUsers(quizId);
        toast({
          title: isAssigned ? "Asignación eliminada" : "Cuestionario asignado",
          description: isAssigned
            ? "El usuario ya no tiene acceso a este cuestionario"
            : "Se ha asignado el cuestionario y enviado un correo de notificación",
        });
      } else {
        console.error("Error in toggleQuizAssignment:", res.status);
        toast({
          title: "Error",
          description: "No se pudo cambiar la asignación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in toggleQuizAssignment:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        ...values,
        categoryId: parseInt(values.categoryId),
        subcategoryId: parseInt(values.subcategoryId),
        timeLimit: parseInt(values.timeLimit),
        totalQuestions: 0,
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
      form.reset();
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
        subcategoryId: parseInt(values.subcategoryId),
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
      form.reset();
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

  // Handlers
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
      subcategoryId: String(quiz.subcategoryId ?? ""),
      timeLimit: String(quiz.timeLimit),
      difficulty: quiz.difficulty,
      isPublic: quiz.isPublic === true,
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    form.reset();
  }

  function handleDelete(id: number) {
    if (window.confirm("¿Estás seguro de eliminar este cuestionario? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  }

  function handleManageQuestions(quizId: number) {
    window.location.href = `/admin/quizzes/${quizId}/questions`;
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
                        <FormLabel>Materia</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una materia" />
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

                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!categoryId || loadingSubcategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              {loadingSubcategories ? (
                                <div className="flex items-center gap-2">
                                  <Spinner className="h-4 w-4" />
                                  <span>Cargando...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder={
                                  !categoryId
                                    ? "Primero selecciona una materia"
                                    : "Selecciona un tema"
                                } />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategoriesResponse
                              ?.filter((sub: any) => sub.categoryId === Number(categoryId))
                              .map((sub: any) => (
                                <SelectItem key={sub.id} value={String(sub.id)}>
                                  {sub.name}
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
                <Accordion type="multiple" className="space-y-4">
                  {/* 1. Categorías con subcategorías */}
                  {hierarchicalData.map((category) => (
                    <AccordionItem key={category.id} value={`cat-${category.id}`} className="border rounded-md">
                      <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/50">
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.subcategories.reduce((acc: number, sub: any) => acc + sub.quizzes.length, 0)} cuestionario(s)
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-0 pt-2">
                        <Accordion type="multiple" className="space-y-2">
                          {category.subcategories.map((subcategory: any) => (
                            subcategory.quizzes.length > 0 && (
                              <AccordionItem
                                key={subcategory.id}
                                value={`subcat-${subcategory.id}`}
                                className="border rounded-md"
                              >
                                <AccordionTrigger className="hover:no-underline px-4 py-2">
                                  <div className="flex-1 text-left">
                                    <h4 className="text-md font-medium">{subcategory.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {subcategory.quizzes.length} cuestionario(s)
                                    </p>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-0 pt-2">
                                  <div className="grid grid-cols-1 gap-3">
                                    {subcategory.quizzes.map((quiz: Quiz) => (
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
                                                          checked={assignedUsers.includes(user.id)}
                                                          onChange={() =>
                                                            toggleQuizAssignment(
                                                              quiz.id,
                                                              user.id,
                                                              assignedUsers.includes(user.id)
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
                            )
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}

                  {/* 2. Quizzes sin categoría/subcategoría */}
                  {quizzesWithoutClassification.length > 0 && (
                    <AccordionItem value="uncategorized" className="border rounded-md">
                      <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/50">
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-medium">Sin materia/tema</h3>
                          <p className="text-sm text-muted-foreground">
                            {quizzesWithoutClassification.length} cuestionario(s) no clasificado(s)
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-0 pt-2">
                        <div className="grid grid-cols-1 gap-3">
                          {quizzesWithoutClassification.map((quiz) => (
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
                                                checked={assignedUsers.includes(user.id)}
                                                onChange={() =>
                                                  toggleQuizAssignment(
                                                    quiz.id,
                                                    user.id,
                                                    assignedUsers.includes(user.id)
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
                  )}
                </Accordion>
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