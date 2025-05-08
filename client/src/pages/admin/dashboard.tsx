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

            {/*chat gpt entrenamiento*/}
            <CardContent>
  <div className="flex flex-col sm:flex-row gap-2">
    <Link href={`/category/${category.id}`} className="w-full sm:w-auto">
      <Button variant="link" className="text-primary w-full sm:w-auto">
        Ver cuestionarios <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </Link>

    <Link href={`/training/${category.id}`}>
  <Button variant="outline">Entrenamiento</Button>
</Link>

  </div>
</CardContent>
{/*fin chat gpt entrenamiento*/}

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

