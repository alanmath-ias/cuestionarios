//deep seek añade para cuestionarios por usuario
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";

export default function QuizUserAdmin() {

  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  interface Quiz {
    id: number;
    title: string;
    difficulty: string;
  }
  
  const { toast } = useToast();
  const [selectedQuizzes, setSelectedQuizzes] = useState<Record<number, number[]>>({});

  // Fetch users
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      return res.json();
    },
  });

  // Fetch quizzes
  const { data: quizzes } = useQuery<Quiz[]>({
  queryKey: ["/api/quizzes"],
  queryFn: async () => {
    const res = await fetch("/api/quizzes");
    if (!res.ok) throw new Error("Error al obtener cuestionarios");
    return res.json();
  },
});

  // Fetch user quizzes
  const { data: userQuizzes } = useQuery({
    queryKey: ["/api/user-quizzes"],
  });

  // Mutation to assign quizzes
  const assignQuizzesMutation = useMutation({
    mutationFn: async ({ userId, quizIds }: { userId: number; quizIds: number[] }) => {
      const response = await fetch(`/api/admin/users/${userId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizIds }),
      });
      if (!response.ok) throw new Error("Error al asignar cuestionarios");
      return response.json();
    },
    onSuccess: () => toast({ title: "Cuestionarios asignados" }),
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  // Handle checkbox changes
  const handleQuizChange = (userId: number, quizId: number, isChecked: boolean) => {
    setSelectedQuizzes(prev => ({
      ...prev,
      [userId]: isChecked
        ? [...(prev[userId] || []), quizId]
        : (prev[userId] || []).filter(id => id !== quizId)
    }));
  };

  // Save quizzes for a user
  const handleSave = (userId: number) => {
    const quizIds = selectedQuizzes[userId] || [];
    assignQuizzesMutation.mutate({ userId, quizIds });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Cuestionarios por Usuario</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {users?.map(user => (
          <div key={user.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Cuestionarios asignados</h3>
              <div className="grid grid-cols-1 gap-2">
                {quizzes?.map(quiz => (
                  <div key={quiz.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedQuizzes[user.id]?.includes(quiz.id) || false}
                      onCheckedChange={(isChecked) => 
                        handleQuizChange(user.id, quiz.id, isChecked as boolean)
                      }
                    />
                    <span>{quiz.title} ({quiz.difficulty})</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
  className="mt-4"
  onClick={() => handleSave(user.id)}
  disabled={assignQuizzesMutation.status === "pending"}
>
  {assignQuizzesMutation.status === "pending" ? "Guardando..." : "Guardar"}
</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

//fin deep seek añade para cuestionarios por usuario
