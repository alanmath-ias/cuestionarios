import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Link } from "wouter";

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
  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      return res.json();
    },
  });

  // Fetch quizzes
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
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
    onSuccess: () => toast({ title: "Cuestionarios asignados", description: "Los cambios se han guardado correctamente." }),
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

  const isLoading = loadingUsers || loadingQuizzes;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">Gestión de Cuestionarios por Usuario</h1>
          <p className="text-slate-400">Asigna cuestionarios específicos a cada usuario.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {users?.map(user => (
            <Card key={user.id} className="bg-slate-900 border-white/10 shadow-xl hover:border-white/20 transition-all">
              <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/30">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-200">{user.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    onClick={() => handleSave(user.id)}
                    disabled={assignQuizzesMutation.status === "pending"}
                  >
                    {assignQuizzesMutation.status === "pending" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-4 text-slate-400 uppercase tracking-wider">Cuestionarios Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quizzes?.map(quiz => {
                    const isChecked = selectedQuizzes[user.id]?.includes(quiz.id) || false;
                    return (
                      <div
                        key={quiz.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${isChecked ? 'bg-blue-500/10 border-blue-500/20' : 'bg-slate-950/50 border-transparent hover:bg-white/5'}`}
                      >
                        <Checkbox
                          id={`user-${user.id}-quiz-${quiz.id}`}
                          checked={isChecked}
                          onCheckedChange={(isChecked) =>
                            handleQuizChange(user.id, quiz.id, isChecked as boolean)
                          }
                          className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label
                          htmlFor={`user-${user.id}-quiz-${quiz.id}`}
                          className="text-sm text-slate-300 cursor-pointer flex-1 select-none"
                        >
                          <span className="font-medium text-slate-200 block">{quiz.title}</span>
                          <span className="text-xs text-slate-500 capitalize">{quiz.difficulty}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
