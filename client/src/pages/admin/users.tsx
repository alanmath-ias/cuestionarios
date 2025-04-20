{/*}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export default function UsersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<Record<number, number[]>>({});

  // Fetch users
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Error al obtener usuarios");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const initialSelectedCategories: Record<number, number[]> = {};
      data.forEach((user: any) => {
        initialSelectedCategories[user.id] = user.categories?.map((category: any) => category.id) || [];
      });
      setSelectedCategories(initialSelectedCategories);
    },
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) {
        throw new Error("Error al obtener categorías");
      }
      return response.json();
    },
  });


  
  // Invalidate queries when the component mounts
  //useEffect(() => {
    //queryClient.invalidateQueries(["/api/users"]);
    //queryClient.invalidateQueries(["/api/admin/categories"]);
  //}, [queryClient]);

  // Mutation to assign categories to a user
  const assignCategoriesMutation = useMutation({
    mutationFn: async ({ userId, categoryIds }: { userId: number; categoryIds: number[] }) => {
      const response = await fetch(`/api/admin/users/${userId}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryIds }),
      });

      if (!response.ok) {
        throw new Error("Error al asignar categorías");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Categorías asignadas",
        description: "Las categorías han sido asignadas correctamente",
      });
      queryClient.invalidateQueries(["/api/users"]); // Refresca los datos de usuarios
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron asignar las categorías",
        variant: "destructive",
      });
      console.error("Error al asignar categorías:", error);
    },
  });

  // Handle checkbox changes
  const handleCategoryChange = (userId: number, categoryId: number, isChecked: boolean) => {
    setSelectedCategories((prev) => {
      const userCategories = prev[userId] || [];
      return {
        ...prev,
        [userId]: isChecked
          ? [...userCategories, categoryId]
          : userCategories.filter((id) => id !== categoryId),
      };
    });
  };

  // Save categories for a user
  const handleSave = (userId: number) => {
    const categoryIds = selectedCategories[userId] || [];
    assignCategoriesMutation.mutate({ userId, categoryIds });
  };

  if (usersLoading || categoriesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <div key={user.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Categorías</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategories[user.id]?.includes(category.id) || false}
                      onCheckedChange={(isChecked) =>
                        handleCategoryChange(user.id, category.id, isChecked)
                      }
                    />
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => handleSave(user.id)}
              disabled={assignCategoriesMutation.isLoading}
            >
              Guardar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
*/}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export default function UsersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<Record<number, number[]>>({});

  // 1. Obtener usuarios (con o sin categorías)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      return res.json();
    }
  });

  // 2. Obtener todas las categorías disponibles
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Error al obtener categorías");
      return res.json();
    }
  });

  // 3. Efecto para inicializar las categorías seleccionadas
  useEffect(() => {
    if (!users) return;

    const initializeCategories = async () => {
      const categoriesMap: Record<number, number[]> = {};

      await Promise.all(
        users.map(async (user: any) => {
          // Primero verifica si el usuario ya trae categorías
          if (user.categories && user.categories.length > 0) {
            categoriesMap[user.id] = user.categories.map((c: any) => c.id);
          } else {
            // Si no, hace fetch individual
            try {
              const res = await fetch(`/api/user-categories/${user.id}`);
              if (res.ok) {
                const userCategories = await res.json();
                categoriesMap[user.id] = userCategories.map((c: any) => c.id);
              }
            } catch (error) {
              console.error(`Error loading categories for user ${user.id}:`, error);
              categoriesMap[user.id] = [];
            }
          }
        })
      );

      setSelectedCategories(categoriesMap);
    };

    initializeCategories();
  }, [users]);

  // 4. Mutación para guardar
  const saveCategories = useMutation({
    mutationFn: async ({ userId, categoryIds }: { userId: number; categoryIds: number[] }) => {
      // Intenta con ambos endpoints
      let res = await fetch(`/api/admin/users/${userId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds }),
      });

      if (!res.ok) {
        res = await fetch(`/api/user-categories/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryIds }),
        });
      }

      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast({ title: "Éxito", description: "Categorías actualizadas" });
      // Actualización optimista
      setSelectedCategories(prev => ({
        ...prev,
        [vars.userId]: vars.categoryIds
      }));
    },
    onError: () => {
      toast({ 
        title: "Error", 
        variant: "destructive", 
        description: "No se pudo guardar" 
      });
    }
  });

  const handleCategoryChange = (userId: number, categoryId: number, checked: boolean) => {
    setSelectedCategories(prev => ({
      ...prev,
      [userId]: checked
        ? [...(prev[userId] || []), categoryId]
        : (prev[userId] || []).filter(id => id !== categoryId)
    }));
  };

  if (usersLoading || categoriesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users?.map((user: any) => (
          <div key={user.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Categorías</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories?.map((category: any) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategories[user.id]?.includes(category.id) || false}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(user.id, category.id, checked as boolean)
                      }
                    />
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="mt-4"
              onClick={() => saveCategories.mutate({ 
                userId: user.id, 
                categoryIds: selectedCategories[user.id] || [] 
              })}
              disabled={saveCategories.isLoading}
            >
              {saveCategories.isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}