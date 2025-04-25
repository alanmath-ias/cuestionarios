
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Category, Quiz } from "@/shared/types";
import { ChevronRight } from "lucide-react";

// Función que realiza la petición para obtener categorías
async function fetchCategories() {
  const response = await fetch("/api/user/categories");
  if (!response.ok) {
    throw new Error("Error al obtener categorías");
  }
  return response.json();
}

// Función que realiza la petición para obtener cuestionarios
async function fetchQuizzes() {
  const response = await fetch("/api/user/quizzes");
  if (!response.ok) {
    throw new Error("Error al obtener cuestionarios");
  }
  return response.json();
}

export default function UserDashboard() {
  // Realizamos las consultas para categorías y cuestionarios
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["/api/user/categories"],
    queryFn: fetchCategories,
  });

  const { data: quizzes, isLoading: loadingQuizzes, error: quizzesError } = useQuery<Quiz[]>({
    queryKey: ["/api/user/quizzes"],
    queryFn: fetchQuizzes,
  });

  const isLoading = loadingCategories || loadingQuizzes;
  const error = categoriesError || quizzesError;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Usuario</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner className="h-12 w-12" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Mostramos el número de categorías asignadas */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Categorías Asignadas</p>
                    <h3 className="text-3xl font-bold">{categories?.length || 0}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/user/categories">
                    <Button variant="ghost" className="p-0 h-auto text-xs text-primary" size="sm">
                      Gestionar <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Mostramos el número de cuestionarios asignados */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Cuestionarios Asignados</p>
                    <h3 className="text-3xl font-bold">{quizzes?.length || 0}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/user/quizzes">
                    <Button variant="ghost" className="p-0 h-auto text-xs text-cyan-500" size="sm">
                      Gestionar <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualización de las categorías asignadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Categorías Asignadas</h2>
              <div className="grid grid-cols-1 gap-6">
                {categories?.map((category) => (
                  <div key={category.id}>
                    <h4>{category.name}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualización de los cuestionarios asignados */}
            <div>
              <h2 className="text-xl font-bold mb-4">Cuestionarios Asignados</h2>
              <div className="grid grid-cols-1 gap-6">
                {quizzes?.map((quiz) => (
                  <div key={quiz.id}>
                    <h4>{quiz.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}