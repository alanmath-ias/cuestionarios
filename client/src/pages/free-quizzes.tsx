import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Category {
  id: number;
  name: string;
  description: string;
  colorClass: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
  isPublic?: boolean;
}

export default function FreeQuizzes() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/public/quizzes"],
    enabled: !categoriesLoading,
  });
  
  // Filter quizzes by selected category
  const filteredQuizzes = quizzes?.filter((quiz) => 
    selectedCategory === "all" || quiz.categoryId === parseInt(selectedCategory)
  );
  
  // Map difficulty to human-readable format
  const difficultyMap: Record<string, { label: string, color: string }> = {
    basic: { label: "Básico", color: "bg-green-100 text-green-800" },
    intermediate: { label: "Intermedio", color: "bg-blue-100 text-blue-800" },
    advanced: { label: "Avanzado", color: "bg-purple-100 text-purple-800" },
    expert: { label: "Experto", color: "bg-red-100 text-red-800" }
  };
  
  function getCategoryName(categoryId: number) {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || "Sin categoría";
  }
  
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Cuestionarios Públicos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practica tus habilidades matemáticas con estos cuestionarios de acceso libre.
            No se requiere iniciar sesión para acceder a estos recursos.
          </p>
        </div>
        
        {(categoriesLoading || quizzesLoading) ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12" />
          </div>
        ) : (
          <Tabs
            defaultValue="all"
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="max-w-5xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-flow-col auto-cols-max gap-2">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {categories?.map((category) => (
                  <TabsTrigger key={category.id} value={category.id.toString()}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value={selectedCategory} className="mt-0">
              {filteredQuizzes && filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
                      <div className={`bg-${quiz.categoryId ? categories?.find(c => c.id === quiz.categoryId)?.colorClass : 'primary'} h-2 w-full`}></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="mb-2">
                            {getCategoryName(quiz.categoryId)}
                          </Badge>
                          <Badge className={difficultyMap[quiz.difficulty]?.color || "bg-gray-100 text-gray-800"}>
                            {difficultyMap[quiz.difficulty]?.label || quiz.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {quiz.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-0 flex-grow">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{quiz.timeLimit} min</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            <span>{quiz.totalQuestions} preguntas</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-4">
                        <Button asChild className="w-full">
                          <Link to={`/start-quiz/${quiz.id}?public=true`}>
                            Iniciar Cuestionario
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay cuestionarios disponibles</h3>
                  <p className="text-muted-foreground">
                    No se encontraron cuestionarios públicos en esta categoría.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Quieres un seguimiento personalizado?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Inicia sesión para guardar tu progreso, ver análisis detallados de tu rendimiento
            y acceder a todos los cuestionarios disponibles.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}