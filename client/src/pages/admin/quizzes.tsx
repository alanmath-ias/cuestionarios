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
import { Trash, Clock, BookOpen, Link as LinkIcon, ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Reorder, AnimatePresence, useDragControls, motion } from "framer-motion";
import { GripVertical } from "lucide-react";

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
  const hierarchicalData = React.useMemo(() => {
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
      const mapData = getMapData(category.id);
      const nodes = mapData?.nodes || [];

      const categorySubcategories = subcategoriesResponse
        .filter((sub: any) => sub.categoryId === category.id)
        .map((sub: any) => {
          // Find if this subcategory matches any map node
          const mapNode = nodes.find((n: any) =>
            n.subcategoryId === sub.id ||
            (n.additionalSubcategories && n.additionalSubcategories.includes(sub.id))
          );

          const level = mapNode ? (mapNode.level ?? 999) : 1000;

          let subQuizzes = (quizzesBySubcategory[sub.id] || []).sort((a, b) => {
            if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
              return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
            }
            return a.title.localeCompare(b.title);
          });

          return {
            ...sub,
            level,
            quizzes: subQuizzes
          };
        })
        .sort((a: any, b: any) => {
          if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
        });

      return {
        ...category,
        subcategories: categorySubcategories
      };
    });

    return result.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [quizzes, categories, subcategoriesResponse]);

  const quizzesWithoutClassification = React.useMemo(() =>
    quizzes?.filter(q => !q.categoryId || !q.subcategoryId) || []
    , [quizzes]);

  const reorderQuizzesMutation = useMutation({
    mutationFn: async ({ orders }: { orders: { id: number; sortOrder: number }[] }) => {
      const res = await fetch("/api/admin/quizzes/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders })
      });
      if (!res.ok) throw new Error("Failed to reorder quizzes");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    }
  });

  const reorderSubcategoriesMutation = useMutation({
    mutationFn: async ({ orders }: { orders: { id: number; sortOrder: number }[] }) => {
      const res = await fetch("/api/admin/subcategories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders })
      });
      if (!res.ok) throw new Error("Failed to reorder subcategories");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcategories"] });
    }
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: async ({ orders }: { orders: { id: number; sortOrder: number }[] }) => {
      const res = await fetch("/api/admin/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders })
      });
      if (!res.ok) throw new Error("Failed to reorder categories");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    }
  });

  // Debouncing logic for reorders
  const reorderTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedReorderQuizzes = React.useCallback((orders: { id: number; sortOrder: number }[]) => {
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    reorderTimerRef.current = setTimeout(() => {
      reorderQuizzesMutation.mutate({ orders });
    }, 1000);
  }, [reorderQuizzesMutation]);

  const debouncedReorderSubcategories = React.useCallback((orders: { id: number; sortOrder: number }[]) => {
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    reorderTimerRef.current = setTimeout(() => {
      reorderSubcategoriesMutation.mutate({ orders });
    }, 1000);
  }, [reorderSubcategoriesMutation]);

  const debouncedReorderCategories = React.useCallback((orders: { id: number; sortOrder: number }[]) => {
    if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    reorderTimerRef.current = setTimeout(() => {
      reorderCategoriesMutation.mutate({ orders });
    }, 1000);
  }, [reorderCategoriesMutation]);

  // Helper for optimistic reorder
  const updateQuizzesCache = React.useCallback((newOrder: Quiz[]) => {
    queryClient.setQueryData(["/api/quizzes"], (old: Quiz[] | undefined) => {
      if (!old) return old;
      return old.map(q => {
        const found = newOrder.find(item => item.id === q.id);
        if (found) {
          return { ...found, sortOrder: newOrder.indexOf(found) };
        }
        return q;
      });
    });

    const orders = newOrder.map((q, index) => ({ id: q.id, sortOrder: index }));
    debouncedReorderQuizzes(orders);
  }, [queryClient, debouncedReorderQuizzes]);

  const updateSubcategoriesCache = React.useCallback((newOrder: Subcategory[]) => {
    queryClient.setQueryData(["/api/admin/subcategories"], (old: Subcategory[] | undefined) => {
      if (!old) return old;
      return old.map(s => {
        const found = newOrder.find(item => item.id === s.id);
        if (found) {
          return { ...found, sortOrder: newOrder.indexOf(found) };
        }
        return s;
      });
    });

    const orders = newOrder.map((s, index) => ({ id: s.id, sortOrder: index }));
    debouncedReorderSubcategories(orders);
  }, [queryClient, debouncedReorderSubcategories]);

  const updateCategoriesCache = React.useCallback((newOrder: Category[]) => {
    queryClient.setQueryData(["/api/categories"], (old: Category[] | undefined) => {
      if (!old) return old;
      return old.map(c => {
        const found = newOrder.find(item => item.id === c.id);
        if (found) {
          return { ...found, sortOrder: newOrder.indexOf(found) };
        }
        return c;
      });
    });

    const orders = newOrder.map((c, index) => ({ id: c.id, sortOrder: index }));
    debouncedReorderCategories(orders);
  }, [queryClient, debouncedReorderCategories]);

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
      filteredHierarchicalData: (filteredData as any[]).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
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
                <div className="flex gap-4 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar cuestionario..."
                      value={quizSearchQuery}
                      onChange={(e) => setQuizSearchQuery(e.target.value)}
                      className="pl-8 bg-slate-950 border-slate-800 text-slate-200 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner className="h-8 w-8 text-blue-500" />
                  </div>
                ) : quizzes && quizzes.length > 0 ? (
                  <div className="space-y-4">
                    <Reorder.Group
                      axis="y"
                      values={filteredHierarchicalData}
                      onReorder={quizSearchQuery ? (newOrder) => { } : updateCategoriesCache}
                      className="space-y-4"
                    >
                      {filteredHierarchicalData.map((category: any) => (
                        <DraggableCategoryItem
                          key={category.id}
                          category={category}
                          setActiveMapCategory={setActiveMapCategory}
                          updateSubcategoriesCache={updateSubcategoriesCache}
                          updateQuizzesCache={updateQuizzesCache}
                          handleEdit={handleEdit}
                          handleDelete={handleDelete}
                          handleManageQuestions={handleManageQuestions}
                          visibleQuizId={visibleQuizId}
                          setVisibleQuizId={setVisibleQuizId}
                          fetchAssignedUsers={fetchAssignedUsers}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          allUsers={allUsers}
                          assignedUsers={assignedUsers}
                          toggleQuizAssignment={toggleQuizAssignment}
                          isExpanded={expandedCategories.includes(`cat-${category.id}`)}
                          onToggle={() => {
                            setExpandedCategories(prev =>
                              prev.includes(`cat-${category.id}`)
                                ? prev.filter(id => id !== `cat-${category.id}`)
                                : [...prev, `cat-${category.id}`]
                            );
                          }}
                          expandedSubcategories={expandedSubcategories}
                          setExpandedSubcategories={setExpandedSubcategories}
                        />
                      ))}
                    </Reorder.Group>

                    {/* 2. Quizzes sin categoría/subcategoría */}
                    {filteredUnclassifiedQuizzes.length > 0 && (
                      <Card className="border border-white/10 rounded-md bg-slate-800/30 overflow-hidden mt-4">
                        <div
                          className="px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setExpandedCategories(prev =>
                              prev.includes("uncategorized")
                                ? prev.filter(id => id !== "uncategorized")
                                : [...prev, "uncategorized"]
                            );
                          }}
                        >
                          <div className="flex-1 text-left">
                            <h3 className="text-lg font-medium">Sin materia/tema</h3>
                            <p className="text-sm text-slate-400">
                              {filteredUnclassifiedQuizzes.length} cuestionario(s) no clasificado(s)
                            </p>
                          </div>
                          <ChevronDown className={cn("h-5 w-5 transition-transform", expandedCategories.includes("uncategorized") && "rotate-180")} />
                        </div>
                        <AnimatePresence>
                          {expandedCategories.includes("uncategorized") && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-slate-900/50 border-t border-white/5"
                            >
                              <div className="px-4 pb-3 pt-2">
                                <div className="grid grid-cols-1 gap-3 py-3">
                                  <AnimatePresence initial={false}>
                                    {filteredUnclassifiedQuizzes.map((quiz) => (
                                      <DraggableQuizItem
                                        key={quiz.id}
                                        quiz={quiz}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        handleManageQuestions={handleManageQuestions}
                                        visibleQuizId={visibleQuizId}
                                        setVisibleQuizId={setVisibleQuizId}
                                        fetchAssignedUsers={fetchAssignedUsers}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        allUsers={allUsers}
                                        assignedUsers={assignedUsers}
                                        toggleQuizAssignment={toggleQuizAssignment}
                                      />
                                    ))}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    )}
                  </div>
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
          <DialogHeader className="p-6 pb-2 shrink-0 bg-slate-900 border-b border-white/10">
            <DialogTitle className="flex items-center gap-2 text-slate-100 text-xl font-bold">
              <MapIcon className="h-6 w-6 text-blue-400" />
              {activeMapCategory ? getMapData(activeMapCategory)?.title : "Mapa de Habilidades"}
            </DialogTitle>
            <DialogDescription className="text-slate-300 font-medium">
              Visualización del árbol de habilidades y cobertura de contenido.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-950 relative">
            {activeMapCategory && getMapData(activeMapCategory) && (
              <SkillTreeView
                nodes={getMapData(activeMapCategory)!.nodes}
                description=""
                progressMap={(() => {
                  const nodes = getMapData(activeMapCategory)!.nodes;
                  const map: Record<string, 'locked' | 'available' | 'completed' | 'in_progress'> = {};

                  // Filter quizzes for this category
                  const categoryQuizzes = quizzes?.filter(q => q.categoryId === activeMapCategory) || [];

                  // Helper to get quizzes for a node
                  const getFilteredQuizzesForNode = (node: ArithmeticNode) => {
                    let contextQuizzes = categoryQuizzes.filter(q =>
                      q.subcategoryId == node.subcategoryId ||
                      (node.additionalSubcategories && node.additionalSubcategories.includes(q.subcategoryId))
                    ) || [];

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

                  nodes.forEach(node => {
                    const hasContent = getFilteredQuizzesForNode(node).length > 0;
                    if (node.behavior === 'container') {
                      const children = nodes.filter(n => n.requires.includes(node.id));
                      const anyChildActive = children.some(c => getFilteredQuizzesForNode(c).length > 0);
                      map[node.id] = (hasContent || anyChildActive) ? 'available' : 'locked';
                    } else {
                      map[node.id] = hasContent ? 'available' : 'locked';
                    }
                  });

                  return map;
                })()}
                allQuizzes={quizzes?.filter(q => q.categoryId === activeMapCategory) || []}
                onNodeClick={(node) => setSelectedNode(node)}
                isAdmin={true}
                title={getMapData(activeMapCategory)?.title || ""}
                subcategories={subcategoriesResponse || []}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Details Dialog */}
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
              const node = selectedNode;
              const categoryQuizzes = quizzes?.filter(q => q.categoryId === activeMapCategory) || [];
              let nodeQuizzes = categoryQuizzes.filter(q =>
                q.subcategoryId == node.subcategoryId ||
                (node.additionalSubcategories && node.additionalSubcategories.includes(q.subcategoryId))
              ) || [];

              if (node.filterKeywords && node.filterKeywords.length > 0) {
                const keywords = node.filterKeywords.map(k => k.toLowerCase());
                nodeQuizzes = nodeQuizzes.filter(q => {
                  const titleLower = q.title.toLowerCase();
                  if (!keywords.some(k => titleLower.includes(k))) return false;
                  if (node.excludeKeywords && node.excludeKeywords.length > 0) {
                    const excludeKeys = node.excludeKeywords.map(k => k.toLowerCase());
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
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${quiz.difficulty === 'básico' || quiz.difficulty === 'Fácil' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          quiz.difficulty === 'intermedio' || quiz.difficulty === 'Medio' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
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
    </div>
  );
}

// --- Sub-components for Draggable Items ---

const DraggableCategoryItem = React.memo(({
  category,
  setActiveMapCategory,
  updateSubcategoriesCache,
  updateQuizzesCache,
  handleEdit,
  handleDelete,
  handleManageQuestions,
  visibleQuizId,
  setVisibleQuizId,
  fetchAssignedUsers,
  searchQuery,
  setSearchQuery,
  allUsers,
  assignedUsers,
  toggleQuizAssignment,
  isExpanded,
  onToggle,
  expandedSubcategories,
  setExpandedSubcategories
}: any) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={category}
      dragControls={controls}
      dragListener={false}
      layout
      className="touch-none relative list-none"
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 25px 30px -5px rgb(0 0 0 / 0.6), 0 0 15px -3px rgba(59, 130, 246, 0.5)",
        zIndex: 100,
        backgroundColor: "rgba(15, 23, 42, 1)",
        border: "2px solid rgba(59, 130, 246, 0.8)"
      }}
      onDragStart={() => {
        document.body.classList.add('dragging-active');
      }}
      onDragEnd={() => {
        document.body.classList.remove('dragging-active');
      }}
      transition={{
        layout: { duration: 0.2, ease: "easeOut" }
      }}
    >
      <Card className={cn(
        "border border-white/10 rounded-md bg-slate-800/30 overflow-hidden mb-4 shadow-md transition-all duration-300",
        isExpanded && "border-blue-500/50 ring-1 ring-blue-500/20"
      )}>
        <div
          className={cn(
            "px-2 py-3 text-slate-200 flex items-center justify-between cursor-pointer group transition-colors",
            isExpanded ? "bg-slate-800" : "bg-slate-800/50 hover:bg-slate-800"
          )}
          onClick={onToggle}
        >
          <div className="flex-1 flex items-center justify-between mr-4">
            <div className="flex items-center gap-1">
              <div
                className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-2 transition-colors relative z-10"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  controls.start(e);
                }}
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <div className={cn(
                "flex items-center gap-3 border-l-2 pl-3 transition-all duration-300",
                isExpanded ? "border-blue-500" : "border-transparent"
              )}>
                <div>
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <p className="text-sm text-slate-400">
                    {category.subcategories.reduce((acc: number, sub: any) => acc + sub.quizzes.length, 0)} cuestionario(s)
                  </p>
                </div>
              </div>
            </div>

            {(category.id === 1 || category.id === 2 || category.id === 4) && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMapCategory(category.id);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-0 transition-all hover:scale-105"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Ver Mapa
              </Button>
            )}
          </div>
          <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden bg-slate-900/50 border-t border-white/5"
            >
              <div className="px-4 pb-2 pt-2">
                <Reorder.Group
                  axis="y"
                  values={category.subcategories}
                  onReorder={searchQuery ? undefined : updateSubcategoriesCache}
                  className="space-y-3 py-2"
                >
                  {category.subcategories
                    .filter((s: any) => s.quizzes.length > 0)
                    .map((subcategory: any) => (
                      <DraggableSubcategoryItem
                        key={subcategory.id}
                        subcategory={subcategory}
                        updateQuizzesCache={updateQuizzesCache}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleManageQuestions={handleManageQuestions}
                        visibleQuizId={visibleQuizId}
                        setVisibleQuizId={setVisibleQuizId}
                        fetchAssignedUsers={fetchAssignedUsers}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        allUsers={allUsers}
                        assignedUsers={assignedUsers}
                        toggleQuizAssignment={toggleQuizAssignment}
                        isExpanded={expandedSubcategories.includes(`subcat-${subcategory.id}`)}
                        onToggle={() => {
                          setExpandedSubcategories((prev: string[]) =>
                            prev.includes(`subcat-${subcategory.id}`)
                              ? prev.filter(id => id !== `subcat-${subcategory.id}`)
                              : [...prev, `subcat-${subcategory.id}`]
                          );
                        }}
                      />
                    ))}
                </Reorder.Group>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </Reorder.Item>
  );
});
DraggableCategoryItem.displayName = "DraggableCategoryItem";

const DraggableSubcategoryItem = React.memo(({
  subcategory,
  updateQuizzesCache,
  handleEdit,
  handleDelete,
  handleManageQuestions,
  visibleQuizId,
  setVisibleQuizId,
  fetchAssignedUsers,
  searchQuery,
  setSearchQuery,
  allUsers,
  assignedUsers,
  toggleQuizAssignment,
  isExpanded,
  onToggle
}: any) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={subcategory}
      dragControls={controls}
      dragListener={false}
      layout
      className="touch-none relative list-none"
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 0 10px -2px rgba(59, 130, 246, 0.4)",
        zIndex: 110,
        backgroundColor: "rgba(30, 41, 59, 1)",
        border: "2px solid rgba(59, 130, 246, 0.8)"
      }}
      onDragStart={() => {
        document.body.classList.add('dragging-active');
      }}
      onDragEnd={() => {
        document.body.classList.remove('dragging-active');
      }}
      transition={{
        layout: { duration: 0.2, ease: "easeOut" }
      }}
    >
      <Card className={cn(
        "border border-white/5 rounded-md bg-slate-950/30 overflow-hidden shadow-sm transition-all duration-300",
        isExpanded && "border-blue-500/30 ring-1 ring-blue-500/10"
      )}>
        <div
          className={cn(
            "px-2 py-2 text-slate-300 hover:text-white cursor-pointer flex items-center justify-between group/subcat transition-colors",
            isExpanded ? "bg-slate-900/50" : "hover:bg-slate-900/30"
          )}
          onClick={onToggle}
        >
          <div className="flex-1 flex items-center gap-1">
            <div
              className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-2 transition-colors relative z-10"
              onPointerDown={(e) => {
                e.stopPropagation();
                controls.start(e);
              }}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className={cn(
              "flex-1 flex items-center gap-3 border-l pl-3 transition-all duration-300",
              isExpanded ? "border-blue-500/50" : "border-transparent"
            )}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-medium">{subcategory.name}</h4>
                </div>
                <p className="text-xs text-slate-500">
                  {subcategory.quizzes.length} cuestionario(s)
                </p>
              </div>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-slate-600 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden bg-slate-900/40 border-t border-white/5"
            >
              <div className="px-4 pb-3 pt-2">
                <Reorder.Group
                  axis="y"
                  values={subcategory.quizzes}
                  onReorder={searchQuery ? undefined : updateQuizzesCache}
                  className="grid grid-cols-1 gap-3"
                >
                  <AnimatePresence initial={false}>
                    {subcategory.quizzes.map((quiz: Quiz) => (
                      <DraggableQuizItem
                        key={quiz.id}
                        quiz={quiz}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleManageQuestions={handleManageQuestions}
                        visibleQuizId={visibleQuizId}
                        setVisibleQuizId={setVisibleQuizId}
                        fetchAssignedUsers={fetchAssignedUsers}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        allUsers={allUsers}
                        assignedUsers={assignedUsers}
                        toggleQuizAssignment={toggleQuizAssignment}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </Reorder.Item>
  );
});
DraggableSubcategoryItem.displayName = "DraggableSubcategoryItem";

const DraggableQuizItem = React.memo(({
  quiz,
  handleEdit,
  handleDelete,
  handleManageQuestions,
  visibleQuizId,
  setVisibleQuizId,
  fetchAssignedUsers,
  searchQuery,
  setSearchQuery,
  allUsers,
  assignedUsers,
  toggleQuizAssignment
}: any) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={quiz}
      dragControls={controls}
      dragListener={false}
      layout
      whileDrag={{
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 0 15px -3px rgba(59, 130, 246, 0.4)",
        zIndex: 120,
        backgroundColor: "rgba(15, 23, 42, 1)",
        border: "2px solid rgba(59, 130, 246, 0.8)"
      }}
      onDragStart={() => {
        document.body.classList.add('dragging-active');
      }}
      onDragEnd={() => {
        document.body.classList.remove('dragging-active');
      }}
      transition={{
        layout: { duration: 0.2, ease: "easeOut" }
      }}
      className="list-none"
    >
      <Card className="overflow-hidden border border-white/5 bg-slate-900 hover:bg-slate-800 transition-all group/quiz shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    controls.start(e);
                  }}
                >
                  <GripVertical className="h-5 w-5" />
                </div>
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
              </div>
              <div className="flex space-x-2 shrink-0">
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

            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center text-slate-400">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  <span>{Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}</span>
                </div>
                <Badge variant={quiz.difficulty === "básico" ? "default" : quiz.difficulty === "intermedio" ? "secondary" : "destructive"} className="bg-slate-800 text-slate-300 border-slate-700">
                  {quiz.difficulty}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setVisibleQuizId(quiz.id);
                        fetchAssignedUsers(quiz.id);
                      }}
                      className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Asignar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Asignar Usuarios</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Acceso para: <span className="text-slate-200 font-medium">{quiz.title}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-700 text-slate-200"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                      {allUsers
                        .filter((u: any) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((user: any) => (
                          <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assignedUsers.includes(user.id)}
                              onChange={() => toggleQuizAssignment(quiz.id, user.id, assignedUsers.includes(user.id))}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.name || user.username}</span>
                              <span className="text-xs text-slate-500">{user.email}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  onClick={() => handleManageQuestions(quiz.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Preguntas
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Reorder.Item>
  );
});
DraggableQuizItem.displayName = "DraggableQuizItem";
