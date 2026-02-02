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
import { Trash, Clock, BookOpen, Link as LinkIcon, ArrowLeft } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Map as MapIcon, CheckCircle2, AlertTriangle, Ban } from "lucide-react";
import { SkillTreeView } from "@/components/roadmap/SkillTreeView";
import { arithmeticMapNodes, ArithmeticNode } from "@/data/arithmetic-map-data";
import { algebraMapNodes } from "@/data/algebra-map-data";
import { calculusMapNodes } from "@/data/calculus-map-data";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Search and Accordion State
  const [quizSearchQuery, setQuizSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeMapCategory, setActiveMapCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [selectedNode, setSelectedNode] = useState<ArithmeticNode | null>(null);


  const getMapData = (catId: number) => {
    switch (catId) {
      case 1: return { nodes: arithmeticMapNodes, title: "Mapa de Aritmética" };
      case 2: return { nodes: algebraMapNodes, title: "Mapa de Álgebra" };
      case 4: return { nodes: calculusMapNodes, title: "Mapa de Cálculo" };
      default: return null;
    }
  };

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
        const res = await fetch("/api/users");
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

  // Filtered Data and Auto-Expansion
  // Filtered Data and Auto-Expansion
  const { filteredHierarchicalData, filteredUnclassifiedQuizzes } = React.useMemo(() => {
    if (!quizSearchQuery) {
      return {
        filteredHierarchicalData: hierarchicalData,
        filteredUnclassifiedQuizzes: quizzesWithoutClassification
      };
    }

    const lowerQuery = quizSearchQuery.toLowerCase();

    const filteredData = hierarchicalData.map(category => {
      const filteredSubcats = category.subcategories.map((sub: any) => {
        const filteredQuizzes = sub.quizzes.filter((q: Quiz) =>
          q.title.toLowerCase().includes(lowerQuery)
        );

        if (filteredQuizzes.length > 0 || sub.name.toLowerCase().includes(lowerQuery)) {
          if (sub.name.toLowerCase().includes(lowerQuery) && filteredQuizzes.length === 0) {
            return sub;
          }
          return { ...sub, quizzes: filteredQuizzes };
        }
        return null;
      }).filter(Boolean);

      if (filteredSubcats.length > 0 || category.name.toLowerCase().includes(lowerQuery)) {
        return { ...category, subcategories: filteredSubcats };
      }
      return null;
    }).filter(Boolean);

    const filteredUnclassified = quizzesWithoutClassification.filter(q =>
      q.title.toLowerCase().includes(lowerQuery)
    );

    return {
      filteredHierarchicalData: filteredData,
      filteredUnclassifiedQuizzes: filteredUnclassified
    };
  }, [hierarchicalData, quizzesWithoutClassification, quizSearchQuery]);

  useEffect(() => {
    if (quizSearchQuery) {
      const newExpandedCategories: string[] = [];
      const newExpandedSubcategories: string[] = [];

      filteredHierarchicalData.forEach((cat: any) => {
        newExpandedCategories.push(`cat-${cat.id}`);
        cat.subcategories.forEach((sub: any) => {
          newExpandedSubcategories.push(`subcat-${sub.id}`);
        });
      });

      if (filteredUnclassifiedQuizzes.length > 0) {
        newExpandedCategories.push("uncategorized");
      }

      setExpandedCategories(newExpandedCategories);
      setExpandedSubcategories(newExpandedSubcategories);
    }
  }, [quizSearchQuery, filteredHierarchicalData, filteredUnclassifiedQuizzes]);

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
      let url = "/api/admin/assignments";
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Administración de Cuestionarios</h1>
            <p className="text-slate-400">Gestiona los cuestionarios y sus preguntas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="sticky top-4 bg-slate-900 border-white/10 shadow-xl">
              <CardHeader className="bg-slate-950/50 border-b border-white/5">
                <CardTitle className="text-slate-100">{editingId ? "Editar Cuestionario" : "Nuevo Cuestionario"}</CardTitle>
                <CardDescription className="text-slate-400">
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
                          <FormLabel className="text-slate-300">Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Álgebra Básica" {...field} className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50" />
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
                          <FormLabel className="text-slate-300">Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe brevemente de qué trata este cuestionario"
                              rows={3}
                              {...field}
                              className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
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
                          <FormLabel className="text-slate-300">Materia</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loadingCategories}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                                <SelectValue placeholder="Selecciona una materia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)} className="focus:bg-slate-800 focus:text-white">
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
                          <FormLabel className="text-slate-300">Tema</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!categoryId || loadingSubcategories}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
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
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                              {subcategoriesResponse
                                ?.filter((sub: any) => sub.categoryId === Number(categoryId))
                                .map((sub: any) => (
                                  <SelectItem key={sub.id} value={String(sub.id)} className="focus:bg-slate-800 focus:text-white">
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
                            <FormLabel className="text-slate-300">Tiempo límite (seg)</FormLabel>
                            <FormControl>
                              <Input type="number" min="30" {...field} className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50" />
                            </FormControl>
                            <FormDescription className="text-xs text-slate-500">
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
                            <FormLabel className="text-slate-300">Dificultad</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                                  <SelectValue placeholder="Nivel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                {difficultyOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="focus:bg-slate-800 focus:text-white">
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-4 bg-slate-950/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-slate-300">Público</FormLabel>
                            <FormDescription className="text-xs text-slate-500">
                              Visible sin registro
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-600"
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
                          className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
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
            <Card className="bg-slate-900 border-white/10 shadow-xl">
              <CardHeader className="bg-slate-950/50 border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100">Cuestionarios Existentes</CardTitle>
                  <CardDescription className="text-slate-400">
                    Lista de todos los cuestionarios disponibles en el sistema
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar cuestionario..."
                    value={quizSearchQuery}
                    onChange={(e) => setQuizSearchQuery(e.target.value)}
                    className="pl-8 bg-slate-950 border-slate-800 text-slate-200 focus:ring-blue-500/50"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner className="h-8 w-8 text-blue-500" />
                  </div>
                ) : quizzes && quizzes.length > 0 ? (
                  <Accordion
                    type="multiple"
                    className="space-y-4"
                    value={expandedCategories}
                    onValueChange={setExpandedCategories}
                  >
                    {/* 1. Categorías con subcategorías */}
                    {filteredHierarchicalData.map((category: any) => (
                      <AccordionItem key={category.id} value={`cat-${category.id}`} className="border border-white/10 rounded-md bg-slate-800/30 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 group">
                          <div className="flex-1 text-left flex items-center justify-between mr-4">
                            <div>
                              <h3 className="text-lg font-medium">{category.name}</h3>
                              <p className="text-sm text-slate-400">
                                {category.subcategories.reduce((acc: number, sub: any) => acc + sub.quizzes.length, 0)} cuestionario(s)
                              </p>
                            </div>

                            {/* Map Button - Only for mapped categories */}
                            {(category.id === 1 || category.id === 2 || category.id === 4) && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMapCategory(category.id);
                                }}
                                className="opacity-100 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-0 transition-all hover:scale-105"
                              >
                                <MapIcon className="h-4 w-4 mr-2" />
                                Ver Mapa
                              </Button>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-0 pt-2 bg-slate-900/50 border-t border-white/5">
                          <Accordion
                            type="multiple"
                            className="space-y-2 py-2"
                            value={expandedSubcategories}
                            onValueChange={setExpandedSubcategories}
                          >
                            {category.subcategories.map((subcategory: any) => (
                              subcategory.quizzes.length > 0 && (
                                <AccordionItem
                                  key={subcategory.id}
                                  value={`subcat-${subcategory.id}`}
                                  className="border border-white/5 rounded-md bg-slate-950/30"
                                >
                                  <AccordionTrigger className="hover:no-underline px-4 py-2 text-slate-300 hover:text-white">
                                    <div className="flex-1 text-left">
                                      <h4 className="text-md font-medium">{subcategory.name}</h4>
                                      <p className="text-xs text-slate-500">
                                        {subcategory.quizzes.length} cuestionario(s)
                                      </p>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-0 pt-2">
                                    <div className="grid grid-cols-1 gap-3 pb-3">
                                      {subcategory.quizzes.map((quiz: Quiz) => (
                                        <Card key={quiz.id} className="overflow-hidden border border-white/5 bg-slate-900 hover:bg-slate-800 transition-all">
                                          <CardContent className="p-6">
                                            <div className="flex flex-col space-y-4">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-slate-200">{quiz.title}</h3>
                                                    {quiz.isPublic && (
                                                      <Badge variant="outline" className="ml-2 border-blue-500/30 text-blue-400 bg-blue-500/10">
                                                        <LinkIcon className="h-3 w-3 mr-1" /> Público
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <p className="text-sm text-slate-400 mt-1">{quiz.description}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(quiz)}
                                                    className="bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                                  >
                                                    Editar
                                                  </Button>
                                                  <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(quiz.id)}
                                                    title="Eliminar cuestionario"
                                                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                                  >
                                                    <Trash className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>

                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                      setVisibleQuizId(quiz.id);
                                                      fetchAssignedUsers(quiz.id);
                                                      setSearchQuery(""); // Reset search on open
                                                    }}
                                                    className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                                  >
                                                    Asignar usuarios
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-h-[80vh] flex flex-col">
                                                  <DialogHeader>
                                                    <DialogTitle>Asignar Usuarios</DialogTitle>
                                                    <DialogDescription className="text-slate-400">
                                                      Selecciona los usuarios que tendrán acceso a: <span className="font-semibold text-slate-200">{quiz.title}</span>
                                                    </DialogDescription>
                                                  </DialogHeader>

                                                  <div className="relative mb-4">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                    <Input
                                                      placeholder="Buscar usuario por nombre o correo..."
                                                      value={searchQuery}
                                                      onChange={(e) => setSearchQuery(e.target.value)}
                                                      className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                                                    {allUsers
                                                      .filter(user =>
                                                        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
                                                      )
                                                      .sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username))
                                                      .map((user) => (
                                                        <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                                          <div className="flex items-center h-5">
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
                                                              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                                                            />
                                                          </div>
                                                          <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-200">{user.name || user.username}</span>
                                                            <span className="text-xs text-slate-500">{user.email}</span>
                                                          </div>
                                                        </label>
                                                      ))}
                                                    {allUsers.filter(user =>
                                                      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    ).length === 0 && (
                                                        <div className="text-center py-8 text-slate-500">
                                                          No se encontraron usuarios
                                                        </div>
                                                      )}
                                                  </div>
                                                </DialogContent>
                                              </Dialog>


                                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                                                <div className="flex items-center text-slate-400">
                                                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                                  <span>{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                                                </div>
                                                <div>
                                                  <Badge variant={
                                                    quiz.difficulty === "básico" ? "default" :
                                                      quiz.difficulty === "intermedio" ? "secondary" : "destructive"
                                                  } className="bg-slate-800 text-slate-300 border-slate-700">
                                                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                                                  </Badge>
                                                </div>
                                                <div>
                                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    {quiz.totalQuestions} {quiz.totalQuestions === 1 ? "pregunta" : "preguntas"}
                                                  </Badge>
                                                </div>
                                              </div>

                                              <Separator className="bg-white/10" />

                                              <div className="flex justify-end">
                                                <Button
                                                  size="sm"
                                                  onClick={() => handleManageQuestions(quiz.id)}
                                                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
                    {filteredUnclassifiedQuizzes.length > 0 && (
                      <AccordionItem value="uncategorized" className="border border-white/10 rounded-md bg-slate-800/30 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200">
                          <div className="flex-1 text-left">
                            <h3 className="text-lg font-medium">Sin materia/tema</h3>
                            <p className="text-sm text-slate-400">
                              {filteredUnclassifiedQuizzes.length} cuestionario(s) no clasificado(s)
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-0 pt-2 bg-slate-900/50 border-t border-white/5">
                          <div className="grid grid-cols-1 gap-3 py-3">
                            {filteredUnclassifiedQuizzes.map((quiz) => (
                              <Card key={quiz.id} className="overflow-hidden border border-white/5 bg-slate-900 hover:bg-slate-800 transition-all">
                                <CardContent className="p-6">
                                  <div className="flex flex-col space-y-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="text-lg font-semibold text-slate-200">{quiz.title}</h3>
                                          {quiz.isPublic && (
                                            <Badge variant="outline" className="ml-2 border-blue-500/30 text-blue-400 bg-blue-500/10">
                                              <LinkIcon className="h-3 w-3 mr-1" /> Público
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">{quiz.description}</p>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEdit(quiz)}
                                          className="bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                        >
                                          Editar
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleDelete(quiz.id)}
                                          title="Eliminar cuestionario"
                                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => {
                                            setVisibleQuizId(quiz.id);
                                            fetchAssignedUsers(quiz.id);
                                            setSearchQuery(""); // Reset search on open
                                          }}
                                          className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                        >
                                          Asignar usuarios
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-h-[80vh] flex flex-col">
                                        <DialogHeader>
                                          <DialogTitle>Asignar Usuarios</DialogTitle>
                                          <DialogDescription className="text-slate-400">
                                            Selecciona los usuarios que tendrán acceso a: <span className="font-semibold text-slate-200">{quiz.title}</span>
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="relative mb-4">
                                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                          <Input
                                            placeholder="Buscar usuario por nombre o correo..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
                                          />
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                                          {allUsers
                                            .filter(user =>
                                              user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                              user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                              user.username?.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username))
                                            .map((user) => (
                                              <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                                <div className="flex items-center h-5">
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
                                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                                                  />
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="text-sm font-medium text-slate-200">{user.name || user.username}</span>
                                                  <span className="text-xs text-slate-500">{user.email}</span>
                                                </div>
                                              </label>
                                            ))}
                                          {allUsers.filter(user =>
                                            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                          ).length === 0 && (
                                              <div className="text-center py-8 text-slate-500">
                                                No se encontraron usuarios
                                              </div>
                                            )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>





                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                                      <div className="flex items-center text-slate-400">
                                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                        <span>{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                                      </div>
                                      <div>
                                        <Badge variant={
                                          quiz.difficulty === "básico" ? "default" :
                                            quiz.difficulty === "intermedio" ? "secondary" : "destructive"
                                        } className="bg-slate-800 text-slate-300 border-slate-700">
                                          {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                          {quiz.totalQuestions} {quiz.totalQuestions === 1 ? "pregunta" : "preguntas"}
                                        </Badge>
                                      </div>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    <div className="flex justify-end">
                                      <Button
                                        size="sm"
                                        onClick={() => handleManageQuestions(quiz.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
                    <div className="mb-4 rounded-full bg-slate-800 h-12 w-12 flex items-center justify-center mx-auto">
                      <BookOpen className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">No hay cuestionarios disponibles</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Crea tu primer cuestionario para empezar.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-white/5 bg-slate-950/30 px-6 py-3">
                <p className="text-sm text-slate-500">
                  Total: <strong className="text-slate-300">{quizzes?.length || 0}</strong> cuestionarios
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      {/* Map Viewer Dialog */}
      <Dialog open={!!activeMapCategory} onOpenChange={(open) => !open && setActiveMapCategory(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 bg-slate-950 border-slate-800 overflow-hidden">
          <DialogHeader className="p-6 pb-2 shrink-0 bg-slate-900/50 border-b border-white/5">
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-blue-400" />
              {activeMapCategory ? getMapData(activeMapCategory)?.title : "Mapa de Habilidades"}
            </DialogTitle>
            <DialogDescription>
              Visualización del árbol de habilidades y cobertura de contenido.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-950 relative">
            {activeMapCategory && getMapData(activeMapCategory) && (
              <SkillTreeView
                nodes={getMapData(activeMapCategory)!.nodes}
                title=""
                description=""
                progressMap={(() => {
                  const nodes = getMapData(activeMapCategory)!.nodes;
                  const map: Record<string, 'locked' | 'available' | 'completed' | 'in_progress'> = {};

                  // Filter quizzes for this category
                  const categoryQuizzes = quizzes?.filter(q => q.categoryId === activeMapCategory) || [];

                  // Helper to get quizzes for a node
                  const getFilteredQuizzesForNode = (node: ArithmeticNode) => {
                    let contextQuizzes = categoryQuizzes.filter(q => q.subcategoryId == node.subcategoryId) || [];

                    if (node.filterKeywords && node.filterKeywords.length > 0) {
                      const keywords = node.filterKeywords.map(k => k.toLowerCase());
                      contextQuizzes = contextQuizzes.filter(q => {
                        const titleLower = q.title.toLowerCase();
                        if (!keywords.some(k => titleLower.includes(k))) return false;
                        if (node.excludeKeywords && node.excludeKeywords.length > 0) {
                          const excludeKeys = node.excludeKeywords.map(k => k.toLowerCase());
                          if (excludeKeys.some(k => titleLower.includes(k))) return false;
                        }
                        return true;
                      });
                    }
                    return contextQuizzes;
                  };

                  // Pass 1: Intrinsic Status (Content vs Empty)
                  nodes.forEach(node => {
                    const hasContent = getFilteredQuizzesForNode(node).length > 0;
                    if (node.behavior === 'container') {
                      // Containers will be calculated in Pass 2
                      map[node.id] = 'locked';
                    } else {
                      map[node.id] = hasContent ? 'available' : 'locked';
                    }
                  });

                  // Pass 2: Container Aggregation (Simple: If any child has content, Container is available)
                  nodes.filter(n => n.behavior === 'container').forEach(container => {
                    const children = nodes.filter(n => n.requires.includes(container.id));
                    const anyChildActive = children.some(c => map[c.id] === 'available');
                    const hasContent = getFilteredQuizzesForNode(container).length > 0; // Containers can also have direct content sometimes

                    if (anyChildActive || hasContent) {
                      map[container.id] = 'available';
                    } else {
                      map[container.id] = 'locked';
                    }
                  });

                  return map;
                })()}
                // Filter ALL quizzes to pass only this category's quizzes to the map
                allQuizzes={quizzes?.filter(q => q.categoryId === activeMapCategory) || []}
                onNodeClick={(node) => {
                  // Find Subcategory logic
                  // We need to find the name of the subcategory for the dialog
                  // But we don't have the subcategories list mapped easily here by ID from the node.
                  // We can fetch or deduce it. Since we are admin, we have `allQuizzes`.
                  // We can just set the node and open the dialog.
                  setSelectedNode(node);

                  // Try to find a quiz that matches to get the subcategory info?
                  // Or just use the node label as title.
                  // User just wants to see the quizzes.
                  // We will use a Dialog for the selected Node.
                }}
                isAdmin={true} // Keep true for solid lines
              />
            )}
          </div>

          {/* Node Details Dialog (Student-like View for Admin) */}
          <Dialog open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
            <DialogContent className="bg-slate-900 border-white/10 text-slate-200 max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-white">
                    {selectedNode?.label}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-slate-400">
                  {selectedNode?.description || "Contenido del módulo"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 pt-2">
                {selectedNode && (() => {
                  const categoryQuizzes = quizzes?.filter(q => q.categoryId === activeMapCategory) || [];
                  let nodeQuizzes = categoryQuizzes.filter(q => q.subcategoryId == selectedNode.subcategoryId) || [];

                  if (selectedNode.filterKeywords && selectedNode.filterKeywords.length > 0) {
                    const keywords = selectedNode.filterKeywords.map(k => k.toLowerCase());
                    nodeQuizzes = nodeQuizzes.filter(q => {
                      const titleLower = q.title.toLowerCase();
                      if (!keywords.some(k => titleLower.includes(k))) return false;
                      if (selectedNode.excludeKeywords && selectedNode.excludeKeywords.length > 0) {
                        const excludeKeys = selectedNode.excludeKeywords.map(k => k.toLowerCase());
                        if (excludeKeys.some(k => titleLower.includes(k))) return false;
                      }
                      return true;
                    });
                  }

                  if (nodeQuizzes.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500">
                        <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No hay cuestionarios vinculados a este nodo.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {nodeQuizzes.map(quiz => (
                        <div key={quiz.id} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-800/40 border border-white/5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-400">
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-slate-200 line-clamp-2">{quiz.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${quiz.difficulty === 'Fácil' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              quiz.difficulty === 'Medio' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                              {quiz.difficulty}
                            </span>
                            <span className="text-xs text-slate-500">
                              ID: {quiz.id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </div>
  );
}
