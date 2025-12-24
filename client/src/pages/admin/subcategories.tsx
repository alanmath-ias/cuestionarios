import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Edit, Plus, Save, X, ChevronDown, ChevronUp, FolderOpen, Youtube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  youtube_sublink?: string | null;
};

export default function SubcategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // New subcategory state
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState("");
  const [newSubcategoryYoutubeLink, setNewSubcategoryYoutubeLink] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingYoutubeLink, setEditingYoutubeLink] = useState("");

  const [openCategoryIds, setOpenCategoryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchSubcategories()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Error fetching categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las materias",
        variant: "destructive",
      });
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch("/api/admin/subcategories");
      if (!response.ok) throw new Error("Error fetching subcategories");
      const data = await response.json();

      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        categoryId: item.categoryId,
        youtube_sublink: item.youtube_sublink,
      }));

      setSubcategories(formattedData);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los temas",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) {
      toast({
        title: "Campos incompletos",
        description: "Debes ingresar un nombre y seleccionar una materia.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
          description: newSubcategoryDescription.trim(),
          categoryId: parseInt(selectedCategoryId),
          youtube_sublink: newSubcategoryYoutubeLink.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Error creating subcategory");

      toast({
        title: "Tema creado",
        description: "El tema ha sido creado exitosamente.",
      });

      setNewSubcategoryName("");
      setNewSubcategoryDescription("");
      setNewSubcategoryYoutubeLink("");
      setSelectedCategoryId("");
      fetchSubcategories();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo crear el tema.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este tema?")) return;

    try {
      const response = await fetch(`/api/admin/subcategories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error deleting subcategory");

      toast({
        title: "Tema eliminado",
        description: "El tema ha sido eliminado correctamente.",
      });
      fetchSubcategories();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tema.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sub: Subcategory) => {
    setEditingId(sub.id);
    setEditingName(sub.name);
    setEditingDescription(sub.description || "");
    setEditingYoutubeLink(sub.youtube_sublink || "");
  };

  const handleUpdate = async () => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "El nombre no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/subcategories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName.trim(),
          description: editingDescription.trim(),
          youtube_sublink: editingYoutubeLink.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Error updating subcategory");

      toast({
        title: "Tema actualizado",
        description: "Los cambios han sido guardados.",
      });

      setEditingId(null);
      setEditingName("");
      setEditingDescription("");
      setEditingYoutubeLink("");
      fetchSubcategories();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema.",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const groupedSubcategories = categories.reduce((acc, category) => {
    acc[category.id] = subcategories.filter(
      (sub) => sub.categoryId === category.id
    );
    return acc;
  }, {} as { [key: number]: Subcategory[] });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Gestión de Temas</h1>
            <p className="text-slate-400">Organiza los temas dentro de cada materia</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-slate-900 border-white/10 shadow-xl">
              <CardHeader className="bg-slate-950/50 border-b border-white/5">
                <CardTitle className="text-slate-100">Nuevo Tema</CardTitle>
                <CardDescription className="text-slate-400">
                  Añade un nuevo tema a una materia existente
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Materia</label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)} className="focus:bg-slate-800 focus:text-white">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre del Tema</label>
                  <Input
                    placeholder="Ej: Ecuaciones Lineales"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Descripción</label>
                  <Textarea
                    placeholder="Breve descripción del tema..."
                    value={newSubcategoryDescription}
                    onChange={(e) => setNewSubcategoryDescription(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Enlace de YouTube (opcional)</label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="https://youtube.com/..."
                      value={newSubcategoryYoutubeLink}
                      onChange={(e) => setNewSubcategoryYoutubeLink(e.target.value)}
                      className="pl-9 bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Tema
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Temas por Materia</h2>

            {categories.map((category) => (
              <Card key={category.id} className="bg-slate-900 border-white/10 overflow-hidden">
                <div
                  onClick={() => toggleCategory(category.id)}
                  className="cursor-pointer p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-medium text-slate-200">{category.name}</h3>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 hover:bg-slate-700">
                      {groupedSubcategories[category.id]?.length || 0} temas
                    </Badge>
                  </div>
                  {openCategoryIds.includes(category.id) ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                {openCategoryIds.includes(category.id) && (
                  <div className="border-t border-white/5 bg-slate-950/30 p-4 space-y-3">
                    {groupedSubcategories[category.id]?.length === 0 ? (
                      <p className="text-slate-500 text-center py-4 italic">No hay temas en esta materia.</p>
                    ) : (
                      groupedSubcategories[category.id]?.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-slate-900 border border-white/5 rounded-lg p-4 transition-all hover:border-white/10"
                        >
                          {editingId === sub.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="bg-slate-950 border-slate-700 text-slate-200"
                                  placeholder="Nombre del tema"
                                />
                                <Input
                                  value={editingYoutubeLink}
                                  onChange={(e) => setEditingYoutubeLink(e.target.value)}
                                  className="bg-slate-950 border-slate-700 text-slate-200"
                                  placeholder="Enlace de YouTube"
                                />
                              </div>
                              <Textarea
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-slate-200"
                                placeholder="Descripción"
                                rows={2}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingId(null)}
                                  className="text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleUpdate}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Guardar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-200 flex items-center gap-2">
                                  {sub.name}
                                  {sub.youtube_sublink && (
                                    <Youtube className="h-4 w-4 text-red-500" />
                                  )}
                                </h4>
                                {sub.description && (
                                  <p className="text-sm text-slate-400 mt-1">{sub.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(sub)}
                                  className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(sub.id)}
                                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
