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
import { Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
});

export default function CategoriesAdmin() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      colorClass: "primary",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(values),
      });
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
      return apiRequest(`/api/admin/categories/${values.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
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
      return apiRequest(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
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

  function handleEdit(category: any) {
    setEditingId(category.id);
    form.reset({
      name: category.name,
      description: category.description,
      colorClass: category.colorClass,
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
    <PageLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Administración de Categorías</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Editar Categoría" : "Nueva Categoría"}</CardTitle>
                <CardDescription>
                  {editingId 
                    ? "Actualiza los detalles de la categoría" 
                    : "Añade una nueva área temática para los cuestionarios"}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      name="colorClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colorOptions.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  {color.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2 pt-2">
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
                        {editingId ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Categorías Existentes</CardTitle>
                <CardDescription>
                  Lista de todas las categorías disponibles en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {categories.map((category: any) => (
                      <Card key={category.id} className="overflow-hidden">
                        <div className={`bg-${category.colorClass} h-2 w-full`}></div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{category.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
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
                  <div className="text-center py-8 text-muted-foreground">
                    No hay categorías disponibles.
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Total: {categories?.length || 0} categorías
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}