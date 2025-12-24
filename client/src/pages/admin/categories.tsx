
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Trash, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/types/types";

const colorOptions = [
  { value: "primary", label: "Azul (Primario)" },
  { value: "secondary", label: "Púrpura (Secundario)" },
  { value: "accent", label: "Verde (Acento)" },
  { value: "destructive", label: "Rojo (Destructivo)" },
  { value: "muted", label: "Gris (Muted)" },
  { value: "popover", label: "Negro (Popover)" },
];

const formSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  colorClass: z.string(),
  youtubeLink: z.string().url({ message: "Debe ser un enlace válido" }).optional(), // Campo opcional
});

export default function CategoriesAdmin() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      colorClass: "primary",
      youtubeLink: "", // Valor predeterminado vacío
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Error al crear la materia");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      form.reset({
        name: "",
        description: "",
        colorClass: "primary",
      });
      toast({
        title: "Materia creada",
        description: "La materia ha sido creada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la materia",
        variant: "destructive",
      });
      console.error("Error al crear la materia:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema> & { id: number }) => {
      const response = await fetch(`/api/admin/categories/${values.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la materia");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingId(null);
      form.reset({
        name: "",
        description: "",
        colorClass: "primary",
      });
      toast({
        title: "Materia actualizada",
        description: "La materia ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la materia",
        variant: "destructive",
      });
      console.error("Error al actualizar la materia:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la materia");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Materia eliminada",
        description: "La materia ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la materia",
        variant: "destructive",
      });
      console.error("Error al eliminar la materia:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingId) {
      updateMutation.mutate({ ...values, id: editingId });
    } else {
      createMutation.mutate(values);
    }
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    form.reset({
      name: category.name,
      description: category.description,
      colorClass: category.colorClass || "primary",
      youtubeLink: category.youtubeLink || "", // Incluye el enlace o un valor vacío
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    form.reset({
      name: "",
      description: "",
      colorClass: "primary",
    });
  }

  function handleDelete(id: number) {
    if (window.confirm("¿Estás seguro de eliminar esta materia? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Administración de Materias</h1>
            <p className="text-slate-400">Gestiona las áreas temáticas de matemáticas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="sticky top-4 bg-slate-900 border-white/10 shadow-xl">
              <CardHeader className="bg-slate-950/50 border-b border-white/5">
                <CardTitle className="text-slate-100">{editingId ? "Editar Materia" : "Nueva Materia"}</CardTitle>
                <CardDescription className="text-slate-400">
                  {editingId
                    ? "Actualiza los detalles de la materia"
                    : "Añade una nueva área temática para los cuestionarios"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Estadística" {...field} className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50" />
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
                              placeholder="Describe brevemente los temas que incluye esta área"
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
                      name="youtubeLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Enlace de YouTube (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.youtube.com/watch?v=..." {...field} className="bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="colorClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                                <SelectValue placeholder="Selecciona un color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                              {colorOptions.map((color) => (
                                <SelectItem key={color.value} value={color.value} className="focus:bg-slate-800 focus:text-white">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-4 w-4 rounded-full bg-${color.value}`}></div>
                                    <span>{color.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                        {editingId ? "Actualizar" : "Crear categoría"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-slate-900 border-white/10 shadow-xl">
              <CardHeader className="bg-slate-950/50 border-b border-white/5">
                <CardTitle className="text-slate-100">Materias Existentes</CardTitle>
                <CardDescription className="text-slate-400">
                  Lista de todas las Materias disponibles en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner className="h-8 w-8 text-blue-500" />
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {categories.map((category: Category) => (
                      <Card key={category.id} className="overflow-hidden border border-white/10 bg-slate-800/50 hover:bg-slate-800 transition-all">
                        <div className={`bg-${category.colorClass} h-2 w-full`}></div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-200">{category.name}</h3>
                              <p className="text-sm text-slate-400 mt-1">{category.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                className="bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
                                title="Eliminar materia"
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
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
                    <div className="mb-4 rounded-full bg-slate-800 h-12 w-12 flex items-center justify-center mx-auto">
                      <Trash className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">No hay materias disponibles</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Crea tu primera materia para empezar a organizar los cuestionarios.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-white/5 bg-slate-950/30 px-6 py-3">
                <p className="text-sm text-slate-500">
                  Total: <strong className="text-slate-300">{categories?.length || 0}</strong> materias
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

