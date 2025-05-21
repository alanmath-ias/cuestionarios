
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
import { Trash } from "lucide-react";
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
        throw new Error("Error al crear la categoría");
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
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      });
      console.error("Error al crear la categoría:", error);
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
        throw new Error("Error al actualizar la categoría");
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
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      });
      console.error("Error al actualizar la categoría:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar la categoría");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
      console.error("Error al eliminar la categoría:", error);
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
    if (window.confirm("¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Administración de Categorías</h1>
          <p className="text-muted-foreground">Gestiona las áreas temáticas de matemáticas</p>
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
              <CardTitle>{editingId ? "Editar Categoría" : "Nueva Categoría"}</CardTitle>
              <CardDescription>
                {editingId 
                  ? "Actualiza los detalles de la categoría" 
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
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input placeholder="Ej: Estadística" {...field} />
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
              placeholder="Describe brevemente los temas que incluye esta área" 
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
      name="youtubeLink"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Enlace de YouTube (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
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
          <FormLabel>Color</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un color" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
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
        >
          Cancelar
        </Button>
      )}
      <Button 
        type="submit" 
        disabled={createMutation.isPending || updateMutation.isPending}
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
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle>Categorías Existentes</CardTitle>
              <CardDescription>
                Lista de todas las categorías disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {categories.map((category: Category) => (
                    <Card key={category.id} className="overflow-hidden border border-muted">
                      <div className={`bg-${category.colorClass} h-2 w-full`}></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(category)}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              title="Eliminar categoría"
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
                  <h3 className="text-lg font-medium">No hay categorías disponibles</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crea tu primera categoría para empezar a organizar los cuestionarios.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-3">
              <p className="text-sm text-muted-foreground">
                Total: <strong>{categories?.length || 0}</strong> categorías
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

