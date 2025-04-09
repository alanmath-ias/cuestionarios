import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BookOpen, Users, ListChecks, Award, ChevronRight } from "lucide-react";
import { Category, Quiz, User } from "@/shared/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/user"],
  });

  const isLoading = loadingCategories || loadingQuizzes || loadingUsers;

  // Datos para gráficos
  const categoryData = categories?.map(category => ({
    name: category.name,
    quizzes: quizzes?.filter(quiz => quiz.categoryId === category.id).length || 0
  })) || [];

  const difficultyData = quizzes ? [
    { name: "Básico", value: quizzes.filter(q => q.difficulty === "básico").length },
    { name: "Intermedio", value: quizzes.filter(q => q.difficulty === "intermedio").length },
    { name: "Avanzado", value: quizzes.filter(q => q.difficulty === "avanzado").length }
  ] : [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión centralizada de AlanMath</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Categorías</p>
                <h3 className="text-3xl font-bold">{categories?.length || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/categories">
                <Button variant="ghost" className="p-0 h-auto text-xs text-primary" size="sm">
                  Gestionar <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Cuestionarios</p>
                <h3 className="text-3xl font-bold">{quizzes?.length || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <ListChecks className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/quizzes">
                <Button variant="ghost" className="p-0 h-auto text-xs text-cyan-500" size="sm">
                  Gestionar <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Usuarios</p>
                <h3 className="text-3xl font-bold">{users?.length || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/users">
                <Button variant="ghost" className="p-0 h-auto text-xs text-amber-500" size="sm">
                  Gestionar <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Evaluaciones</p>
                <h3 className="text-3xl font-bold">--</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/reports">
                <Button variant="ghost" className="p-0 h-auto text-xs text-red-500" size="sm">
                  Ver reportes <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Spinner className="h-12 w-12" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cuestionarios por Categoría</CardTitle>
                  <CardDescription>
                    Distribución de cuestionarios en las diferentes áreas temáticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="quizzes" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                      No hay datos suficientes para mostrar
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Dificultad</CardTitle>
                  <CardDescription>
                    Niveles de dificultad de los cuestionarios disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {difficultyData.some(d => d.value > 0) ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={difficultyData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {difficultyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                      No hay datos suficientes para mostrar
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Recientes</CardTitle>
                <CardDescription>
                  Actividad reciente del sistema (próximamente)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                  Esta funcionalidad estará disponible próximamente.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}