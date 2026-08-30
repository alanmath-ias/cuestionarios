import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  Star, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  User,
  Calendar,
  BookOpen,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  isAiGenerated: boolean;
  isPublic: boolean;
  createdByUserId: number;
  categoryId: number;
  subcategoryId: number;
  createdAt: string;
  totalQuestions: number;
  difficulty: string;
}

export default function AiQuizzesAdmin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [promotingQuiz, setPromotingQuiz] = useState<Quiz | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subSearch, setSubSearch] = useState("");

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user ? (user.name || user.username) : "Usuario desconocido";
  };

  const aiQuizzes = quizzes?.filter(q => q.isAiGenerated && !q.isPublic) || [];
  
  const filteredQuizzes = aiQuizzes.filter(quiz => {
    const creator = getUserName(quiz.createdByUserId).toLowerCase();
    const title = quiz.title.toLowerCase();
    const desc = quiz.description.toLowerCase();
    const search = searchTerm.toLowerCase();
    return title.includes(search) || creator.includes(search) || desc.includes(search);
  });

  const filteredSubcategories = subcategories.filter(sub => 
    sub.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  const isAllSelected = filteredQuizzes.length > 0 && filteredQuizzes.every((q) => selectedQuizIds.includes(q.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredSet = new Set(filteredQuizzes.map((q) => q.id));
      setSelectedQuizIds(selectedQuizIds.filter((id) => !filteredSet.has(id)));
    } else {
      const newIds = new Set([...selectedQuizIds, ...filteredQuizzes.map((q) => q.id)]);
      setSelectedQuizIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedQuizIds.includes(id)) {
      setSelectedQuizIds(selectedQuizIds.filter((i) => i !== id));
    } else {
      setSelectedQuizIds([...selectedQuizIds, id]);
    }
  };

  // Fetch subcategories when category changes in promotion dialog
  useEffect(() => {
    if (selectedCategoryId) {
      fetch(`/api/admin/subcategories/by-category/${selectedCategoryId}`)
        .then(res => res.json())
        .then(data => setSubcategories(Array.isArray(data) ? data : []))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  const promoteMutation = useMutation({
    mutationFn: async (data: { quizId: number; categoryId: number; subcategoryId: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/quizzes/${data.quizId}/promote`, {
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "¡Cuestionario Promovido!",
        description: "El cuestionario ahora es parte del mapa oficial.",
      });
      setPromotingQuiz(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error al promover",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/quizzes/${id}`);
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["/api/quizzes"] });
      const previous = queryClient.getQueryData(["/api/quizzes"]);
      queryClient.setQueryData(["/api/quizzes"], (old: Quiz[] | undefined) =>
        old ? old.filter((q) => q.id !== id) : []
      );
      toast({ title: "Cuestionario eliminado" });
      setSelectedQuizIds(prev => prev.filter(i => i !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/quizzes"], context.previous);
      }
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el cuestionario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await apiRequest("DELETE", "/api/admin/quizzes/bulk", { ids });
    },
    onMutate: async (ids: number[]) => {
      await queryClient.cancelQueries({ queryKey: ["/api/quizzes"] });
      const previous = queryClient.getQueryData(["/api/quizzes"]);
      const idsSet = new Set(ids);
      queryClient.setQueryData(["/api/quizzes"], (old: Quiz[] | undefined) =>
        old ? old.filter((q) => !idsSet.has(q.id)) : []
      );
      toast({ title: `${ids.length} cuestionario(s) eliminado(s)` });
      setSelectedQuizIds([]);
      setIsBulkDeleteOpen(false);
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/quizzes"], context.previous);
      }
      toast({
        title: "Error al eliminar en masa",
        description: "No se pudieron eliminar los cuestionarios seleccionados.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    },
  });

  const handlePromote = () => {
    if (!promotingQuiz || !selectedCategoryId || !selectedSubcategoryId) return;
    promoteMutation.mutate({
      quizId: promotingQuiz.id,
      categoryId: parseInt(selectedCategoryId),
      subcategoryId: parseInt(selectedSubcategoryId)
    });
  };

  if (loadingQuizzes) {
    return <div className="p-8 text-center text-slate-400">Cargando cuestionarios mágicos...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Wand2 className="h-8 w-8 text-amber-500" />
            Gestión de Cuestionarios IA
          </h1>
          <p className="text-slate-400 mt-1">
            Revisa y promueve los cuestionarios generados por la magia de la Inteligencia Artificial.
          </p>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Buscar por título, descripción o usuario..." 
            className="pl-10 bg-slate-900 border-white/10 text-white focus:border-amber-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedQuizIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-red-950/40 border border-red-500/30 rounded-xl animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="bg-red-600 text-white px-3 py-1 font-semibold">
              {selectedQuizIds.length} seleccionado{selectedQuizIds.length > 1 ? "s" : ""}
            </Badge>
            <span className="text-sm text-slate-300">
              Has marcado {selectedQuizIds.length} cuestionario{selectedQuizIds.length > 1 ? "s" : ""} para acción en lote.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
              onClick={() => setSelectedQuizIds([])}
            >
              Desmarcar todos
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="bg-red-600 hover:bg-red-500 text-white gap-2 font-medium shadow-lg shadow-red-600/20"
              onClick={() => setIsBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar seleccionados ({selectedQuizIds.length})
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead className="text-slate-300">Cuestionario</TableHead>
                <TableHead className="text-slate-300">Creado por</TableHead>
                <TableHead className="text-slate-300">Fecha</TableHead>
                <TableHead className="text-slate-300">Estado</TableHead>
                <TableHead className="text-slate-300 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz.id} className={cn(
                    "border-white/5 hover:bg-white/5 transition-colors group",
                    selectedQuizIds.includes(quiz.id) && "bg-amber-500/5 hover:bg-amber-500/10"
                  )}>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedQuizIds.includes(quiz.id)}
                        onCheckedChange={() => toggleSelectOne(quiz.id)}
                        aria-label={`Seleccionar ${quiz.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100">{quiz.title}</span>
                        <span className="text-xs text-slate-500">{quiz.description}</span>
                        <div className="flex gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] bg-slate-800 border-slate-700 text-slate-200">
                                {quiz.totalQuestions} preguntas
                            </Badge>
                            <Badge variant="outline" className={cn(
                                "text-[10px] bg-slate-800 border-slate-700",
                                quiz.difficulty === 'hard' ? 'text-red-400' : 
                                quiz.difficulty === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                            )}>
                                {quiz.difficulty === 'easy' ? 'Fácil' : quiz.difficulty === 'hard' ? 'Difícil' : 'Media'}
                            </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-blue-400" />
                        {getUserName(quiz.createdByUserId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {quiz.createdAt ? format(new Date(quiz.createdAt), "d 'de' MMMM", { locale: es }) : "Reciente"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {quiz.isPublic ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Público
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-700">
                          Privado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          onClick={() => setLocation(`/quiz/${quiz.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!quiz.isPublic && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-500 text-white gap-2 shadow-lg shadow-amber-500/20"
                            onClick={() => {
                              setPromotingQuiz(quiz);
                              setSelectedCategoryId(quiz.categoryId?.toString() || "");
                              setSelectedSubcategoryId(quiz.subcategoryId?.toString() || "");
                            }}
                          >
                            <Star className="h-4 w-4 fill-white" />
                            Promover
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => {
                            if (confirm("¿Estás seguro de eliminar este cuestionario mágico?")) {
                              deleteMutation.mutate(quiz.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No hay cuestionarios generados por IA todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Promotion Dialog */}
      <Dialog open={!!promotingQuiz} onOpenChange={(open) => !open && setPromotingQuiz(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white [&>button]:z-[100] [&>button]:opacity-100 [&>button]:text-slate-400 [&>button]:hover:text-blue-400 [&>button]:transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <Star className="h-5 w-5 fill-amber-400" />
              Promover al Mapa Oficial
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Elige el destino oficial para este cuestionario. Una vez promovido, será visible para todos en el mapa seleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Ubicación Actual</Label>
              <div className="text-sm p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <div className="text-slate-400">
                  Sugerido para: <span className="text-blue-400 font-medium">{categories?.find(c => c.id === promotingQuiz?.categoryId)?.name || 'Sin categoría'}</span>
                </div>
                <div className="text-xs text-slate-500 border-t border-white/5 pt-2 italic">
                  {promotingQuiz?.description}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promote-category">Materia Destino</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger id="promote-category" className="bg-slate-950 border-white/10">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-white/10 text-white">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promote-subcategory">Tema Destino</Label>
                <Select
                  value={selectedSubcategoryId}
                  onValueChange={setSelectedSubcategoryId}
                  disabled={!selectedCategoryId}
                >
                  <SelectTrigger id="promote-subcategory" className="bg-slate-950 border-white/10">
                    <SelectValue placeholder="Selecciona tema..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-white/10 text-white max-h-[300px]">
                    <div className="p-2 sticky top-0 bg-slate-950 z-10 border-b border-white/5 mb-1">
                       <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                          <Input 
                             placeholder="Filtrar temas..." 
                             className="h-8 pl-7 text-xs bg-slate-900 border-white/5"
                             value={subSearch}
                             onChange={(e) => setSubSearch(e.target.value)}
                          />
                       </div>
                    </div>
                    {filteredSubcategories.length > 0 ? (
                        filteredSubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                        ))
                    ) : (
                        <div className="py-2 px-2 text-xs text-slate-500 italic">No se encontraron temas</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPromotingQuiz(null)}>
              Cancelar
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-500 text-white px-8"
              onClick={handlePromote}
              disabled={promoteMutation.isPending || !selectedSubcategoryId}
            >
              Confirmar Magia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              ¿Eliminar {selectedQuizIds.length} cuestionario{selectedQuizIds.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción eliminará de forma permanente los {selectedQuizIds.length} cuestionarios seleccionados, incluyendo sus preguntas y opciones de respuesta. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500 text-white font-medium px-6"
              onClick={() => bulkDeleteMutation.mutate(selectedQuizIds)}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Eliminando..." : "Sí, eliminar todos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
