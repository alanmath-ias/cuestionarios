import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import QuizList from "@/pages/quiz-list";
import ActiveQuiz from "@/pages/active-quiz";
import QuizResults from "@/pages/quiz-results";
import FreeQuizzes from "@/pages/free-quizzes";
import ProfilePage from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import CategoriesAdmin from "@/pages/admin/categories";
import QuizzesAdmin from "@/pages/admin/quizzes";
import QuestionsAdmin from "@/pages/admin/questions";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { PageLayout } from "@/components/layout/page-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/types";
import { useEffect } from "react";
import AllUsersCategoriesAdmin from './pages/admin/AllUsersCategoriesAdmin';

import AdminQuizReview from './pages/admin/AdminQuizReview';

{/*chat gpt entrenamiento*/}
import TrainingPage from "@/pages/training/[categoryId]";
import TrainingPageSub from "@/pages/training2/[categoryId]/[subcategoryId]";

{/*chat gpt calificar*/}
import Calificar from "@/pages/admin/Calificar";
import subcategories from "./pages/admin/subcategories";
import RegistrarPadres from "@/pages/admin/RegistrarPadres";
import ParentDashboard from "@/pages/parent/parentDashboard";

import EncuestaPage from '@/pages/EncuestaPage';

// En tu router.tsx o App.tsx
import PublicActiveQuiz from '@/pages/PublicActiveQuiz';
import PublicQuizResults from '@/pages/PublicQuizResults';


//Protectroute que permite el ingreso a cuestionarios publicos:
const PUBLIC_QUIZZES = [1, 2, 3, 4]; // IDs de los cuestionarios públicos

function ProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      const isPublicQuiz = rest.path.startsWith('/quiz/') && PUBLIC_QUIZZES.includes(parseInt(rest.path.split('/quiz/')[1]));
      
      if (!user && !isPublicQuiz) {
        navigate('/auth'); // Redirige a la página de inicio de sesión si no está autenticado y no es un cuestionario público
      } else if (user?.role === 'admin' && rest.path === '/') {
        navigate('/admin'); // Redirige a /admin si el usuario es administrador
      } else if (user?.role === 'parent') {
        navigate('/parent-dashboard'); // Redirige a /parent-dashboard si el usuario es un padre
      }
    }
  }, [user, isLoading, navigate, rest.path]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user && !PUBLIC_QUIZZES.includes(parseInt(rest.path.split('/quiz/')[1]))) {
    return null;
  }

  return <PageLayout><Component {...rest} /></PageLayout>;
}

/*
function ProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth'); // Redirige a la página de inicio de sesión si no está autenticado
      } else if (user.role === 'admin' && rest.path === '/') {
        navigate('/admin'); // Redirige a /admin si el usuario es administrador
      } else if (user.role === 'parent') {
        navigate('/parent-dashboard'); // Redirige a /parent-dashboard si el usuario es un padre
      }
    }
  }, [user, isLoading, navigate]);



  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return <PageLayout><Component {...rest} /></PageLayout>;
}

*/
function AdminProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  const [_, navigate] = useLocation();

  useEffect(() => {
    {/* Verificar si el usuario no está autenticado o no es admin*/}
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <PageLayout><Component {...rest} /></PageLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        {() => <AuthPage />}
      </Route>

      <Route path="/EncuestaPage">
  {() => <EncuestaPage />}
</Route>

// Agregar estas rutas
<Route path="/public-quiz/:quizId">
  {(params) => <PublicActiveQuiz />}
</Route>
<Route path="/public-quiz-results">
  {() => <PublicQuizResults />}
</Route>


      {/* Rutas de estudiante */}
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} path="/" />}
      </Route>
      <Route path="/category/:categoryId">
        {(params) => <ProtectedRoute component={QuizList} path={`/category/${params.categoryId}`} />}
      </Route>
      <Route path="/quiz/:quizId">
        {(params) => <ProtectedRoute component={ActiveQuiz} path={`/quiz/${params.quizId}`} />}
      </Route>
      <Route path="/results/:progressId">
        {(params) => <ProtectedRoute component={QuizResults} path={`/results/${params.progressId}`} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} path="/profile" />}
      </Route>
      <Route path="/free-quizzes">
        {() => <PageLayout><FreeQuizzes /></PageLayout>}
      </Route>

      {/* Rutas administrativas */}
      <Route path="/admin">
        {() => <AdminProtectedRoute component={AdminDashboard} path="/admin/AdminDashboard" />}
      </Route>
      <Route path="/admin/categories">
        {() => <AdminProtectedRoute component={CategoriesAdmin} path="/admin/categories" />}
      </Route>
      <Route path="/admin/quizzes">
        {() => <AdminProtectedRoute component={QuizzesAdmin} path="/admin/quizzes" />}
      </Route>
      <Route path="/admin/quizzes/:quizId/questions">
        {(params) => <AdminProtectedRoute component={QuestionsAdmin} path={`/admin/quizzes/${params.quizId}/questions`} />}
      </Route>
      <Route path="/admin/calificar">
        {() => <AdminProtectedRoute component={Calificar} path="/admin/calificar" />}
      </Route>
      <Route path="/admin/review/:progressId">
  {() => <AdminProtectedRoute component={AdminQuizReview} path="/admin/review/:progressId" />}
</Route>

<Route path="/admin/AdminDashboard">
        {() => <AdminProtectedRoute component={AdminDashboard} path="/admin/AdminDashboard" />}
      </Route>
       
{/*chat gpt calificar ruta para el boton que lleva a quiz-results*/}
<AdminProtectedRoute path="/admin/quiz-results/:progressId" component={QuizResults} />
{/*chat gpt*/}


{/* Nueva ruta para administración de categorías por usuario */}
     
      <Route path="/admin/urlusercategories">
  <AdminProtectedRoute 
    component={AllUsersCategoriesAdmin}
    path="/admin/urlusercategories" 
  />
</Route>

{/*Ruta para subcategorias*/}
<Route path="/admin/subcategories">
  <AdminProtectedRoute 
    component={subcategories}
    path="/admin/subcategories" 
  />
</Route>



{/*chat gpt entrenamiento viejo funciona perfecto pero muy simple*/}
<Route path="/training/:categoryId">
  {(params) => <TrainingPage categoryId={params.categoryId} />}
</Route>

<Route path="/training2/:categoryId/:subcategoryId">
  <TrainingPageSub /> {/* Sin pasar props manualmente */}
</Route>

<Route path="/admin/RegistrarPadres">
  <AdminProtectedRoute 
    component={RegistrarPadres}
    path="/admin/RegistrarPadres" 
  />
</Route>

<Route path="/parent-dashboard">
        {() => <ProtectedRoute component={ParentDashboard} path="/parent-dashboard" />}
      </Route>

      {/* Ruta de 404 */}
      <Route>
        {() => <PageLayout><NotFound /></PageLayout>}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}


export default App;
