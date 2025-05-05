{/*
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Category, Quiz } from "@/shared/types";
import { BookOpen, ListChecks, ChevronRight, Repeat } from "lucide-react";
import { Link } from "wouter";


async function fetchCategories() {
  const response = await fetch("/api/user/categories", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al obtener categorías");
  }
  return response.json();
}

async function fetchQuizzes() {
  const response = await fetch("/api/user/quizzes", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al obtener cuestionarios");
  }
  return response.json();
}

export default function UserDashboard() {
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["user-categories"],
    queryFn: fetchCategories,
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["user-quizzes"],
    queryFn: fetchQuizzes,
  });

  const isLoading = loadingCategories || loadingQuizzes;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a tu Panel</h1>
      <p className="text-muted-foreground mb-6">Aquí puedes acceder a tus categorías y cuestionarios asignados</p>

      <h2 className="text-xl font-semibold mb-3">Tus Categorías</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="text-sm">Categoría asignada</CardDescription>
              </div>
              <BookOpen className="h-6 w-6 text-primary" />
            </CardHeader>

            <CardContent>
  <div className="flex flex-col sm:flex-row gap-2">
    <Link href={`/category/${category.id}`} className="w-full sm:w-auto">
      <Button
        variant="outline"
        className="w-full sm:w-auto flex items-center justify-center font-semibold"
      >
        Ver cuestionarios
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>

    <Link href={`/training/${category.id}`} className="w-full sm:w-auto">
      <Button
        variant="default" // color principal del sistema
        className="w-full sm:w-auto flex items-center justify-center font-semibold"
      >
        Entrenamiento
      </Button>
    </Link>
  </div>
</CardContent>


          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">Tus Cuestionarios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quizzes?.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription className="text-sm capitalize">{quiz.difficulty}</CardDescription>
              </div>
              <ListChecks className="h-6 w-6 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <Link href={`/quiz/${quiz.id}`}>
                <Button variant="link" className="text-cyan-500">
                  Resolver <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

*/}
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Category, Quiz } from "@/shared/types";
import {
  BookOpen,
  ListChecks,
  ChevronRight,
  Repeat,
  CheckCircle2,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react";
import { Link } from "wouter";

// Obtener el usuario actual
async function fetchCurrentUser() {
  const response = await fetch("/api/me", { credentials: "include" });
  if (!response.ok) {
    throw new Error("No se pudo obtener el usuario");
  }
  return response.json();
}

// Obtener categorías asignadas
async function fetchCategories() {
  const response = await fetch("/api/user/categories", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al obtener categorías");
  }
  return response.json();
}

// Obtener quizzes asignados
async function fetchQuizzes() {
  const response = await fetch("/api/user/quizzes", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al obtener cuestionarios");
  }
  return response.json();
}

export default function UserDashboard() {
  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["user-categories"],
    queryFn: fetchCategories,
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["user-quizzes"],
    queryFn: fetchQuizzes,
  });

  const isLoading = loadingUser || loadingCategories || loadingQuizzes;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  const completedQuizzes = quizzes?.filter((q) => q.status === "completed") || [];
  const pendingQuizzes = quizzes?.filter((q) => q.status !== "completed") || [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Hola {currentUser?.name}</h1>
      <p className="text-muted-foreground mb-6">
        Aquí puedes acceder a tus categorías y cuestionarios asignados
      </p>

      <h2 className="text-xl font-semibold mb-3">Tus Categorías</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="text-sm">Categoría asignada</CardDescription>
              </div>
              <BookOpen className="h-6 w-6 text-primary" />
            </CardHeader>

            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href={`/category/${category.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center font-semibold"
                  >
                    Ver cuestionarios
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href={`/training/${category.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    className="w-full sm:w-auto flex items-center justify-center font-semibold"
                  >
                    Entrenamiento
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tareas Pendientes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">Tareas Pendientes</h2>
          </div>
          {pendingQuizzes.length === 0 ? (
            <p className="text-muted-foreground">No tienes tareas pendientes.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingQuizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm capitalize">
                        {quiz.difficulty}
                      </CardDescription>
                    </div>
                    <ListChecks className="h-6 w-6 text-cyan-500" />
                  </CardHeader>
                  <CardContent>
                    <Link href={`/quiz/${quiz.id}`}>
                      <Button variant="secondary" className="flex items-center">
                        Resolver
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tareas Terminadas */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold text-green-800">Tareas Terminadas</h2>
          </div>
          {completedQuizzes.length === 0 ? (
            <p className="text-muted-foreground">No has completado ninguna tarea aún.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedQuizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm capitalize">
                        {quiz.difficulty}
                      </CardDescription>
                    </div>
                    {/* Ocultar ícono azul si fue revisado */}
                    {!quiz.reviewed && (
                      <ListChecks className="h-6 w-6 text-cyan-500" />
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <Link href={`/quiz/${quiz.id}`}>
                      <Button variant="default" className="flex items-center">
                        Ver resultados
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    {quiz.reviewed && (
                      <div className="flex flex-col items-center ml-2">
                        <CheckCircle2 className="text-green-600 h-6 w-6" />
                        <span className="text-xs text-green-700">Revisado</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
