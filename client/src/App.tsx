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
import WelcomePage from "@/pages/welcome";
import CategoriesAdmin from "@/pages/admin/categories";
import QuizzesAdmin from "@/pages/admin/quizzes";
import QuestionsAdmin from "@/pages/admin/questions";
import UsersAdmin from "@/pages/admin/users";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import HistoryPage from "@/pages/history";
import { PageLayout } from "@/components/layout/page-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/types";
import { useEffect } from "react";
import AllUsersCategoriesAdmin from './pages/admin/AllUsersCategoriesAdmin';

import AdminQuizReview from './pages/admin/AdminQuizReview';
import AdminReports from './pages/admin/reports';
import SendEmail from './pages/admin/SendEmail';
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

{/*chat gpt entrenamiento*/ }
import TrainingPage from "@/pages/training/[categoryId]";
import TrainingPageSub from "@/pages/training2/[categoryId]/[subcategoryId]";

{/*chat gpt calificar*/ }
import Calificar from "@/pages/admin/Calificar";
import subcategories from "./pages/admin/subcategories";
import RegistrarPadres from "@/pages/admin/RegistrarPadres";
import ParentDashboard from "@/pages/parent/parentDashboard";

import EncuestaPage from '@/pages/EncuestaPage';

// En tu router.tsx o App.tsx
import PublicActiveQuiz from '@/pages/PublicActiveQuiz';
import PublicQuizResults from '@/pages/PublicQuizResults';
import ForgotPasswordPage from '@/pages/forgot-password';
import ResetPasswordPage from '@/pages/reset-password';

import LandingPage from "@/pages/landing-page";
import SubscriptionPage from "@/pages/subscription";
import PaymentSuccessPage from "@/pages/payment-success";
import PaymentFailurePage from "@/pages/payment-failure";


//Protectroute que permite el ingreso a cuestionarios publicos:
const PUBLIC_QUIZZES = [1, 2, 3, 4, 278]; // IDs de los cuestionarios públicos

function ImpersonationBanner() {
  const { data: user } = useQuery<User>({ queryKey: ['/api/user'] });

  const stopImpersonationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/stop-impersonating");
    },
    onSuccess: () => {
      window.location.href = "/admin/users";
    },
  });

  if (!user?.isImpersonating) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-white/20 animate-in slide-in-from-bottom-5">
      <div className="flex flex-col">
        <span className="font-bold text-sm">Modo Vista de Usuario</span>
        <span className="text-xs opacity-90">Viendo como: {user.username}</span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => stopImpersonationMutation.mutate()}
        className="bg-white text-red-600 hover:bg-white/90 font-bold border-0"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Salir
      </Button>
    </div>
  );
}

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
        // Allow parents to access specific routes like quiz, results, and category
        const allowedParentRoutes = ['/parent-dashboard', '/quiz/', '/results/', '/category/'];
        const isAllowed = allowedParentRoutes.some(route => rest.path.startsWith(route));

        if (!isAllowed) {
          navigate('/parent-dashboard'); // Redirect to parent dashboard only if not on an allowed route
        }
      }
    }
  }, [user, isLoading, navigate, rest.path]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-white">Cargando...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user && !PUBLIC_QUIZZES.includes(parseInt(rest.path.split('/quiz/')[1]))) {
    return null;
  }

  return <PageLayout><Component {...rest} /></PageLayout>;
}

function AdminProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const [_, navigate] = useLocation();

  useEffect(() => {
    {/* Verificar si el usuario no está autenticado o no es admin*/ }
    if (!isLoading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Cargando...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <PageLayout>
      <AdminBreadcrumbs />
      <Component {...rest} />
    </PageLayout>
  );
}

function RootRoute() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-white">Cargando...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (user) return null;

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        {() => <AuthPage />}
      </Route>
      <Route path="/welcome">
        {() => <WelcomePage />}
      </Route>
      <Route path="/forgot-password">
        {() => <ForgotPasswordPage />}
      </Route>
      <Route path="/reset-password">
        {() => <ResetPasswordPage />}
      </Route>

      <Route path="/EncuestaPage">
        {() => <EncuestaPage />}
      </Route>

      {/* Agregar estas rutas */}
      <Route path="/public-quiz/:quizId">
        {(params) => <PublicActiveQuiz />}
      </Route>
      <Route path="/public-quiz-results">
        {() => <PublicQuizResults />}
      </Route>


      {/* Rutas de estudiante */}
      <Route path="/">
        {() => <RootRoute />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} path="/dashboard" />}
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
      <Route path="/history">
        {() => <ProtectedRoute component={HistoryPage} path="/history" />}
      </Route>
      <Route path="/subscription">
        {() => <ProtectedRoute component={SubscriptionPage} path="/subscription" />}
      </Route>
      <Route path="/payment-success">
        {() => <ProtectedRoute component={PaymentSuccessPage} path="/payment-success" />}
      </Route>
      <Route path="/payment-failure">
        {() => <ProtectedRoute component={PaymentFailurePage} path="/payment-failure" />}
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
      <Route path="/admin/users">
        {() => <AdminProtectedRoute component={UsersAdmin} path="/admin/users" />}
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
      <Route path="/admin/reports">
        {() => <AdminProtectedRoute component={AdminReports} path="/admin/reports" />}
      </Route>
      <Route path="/admin/send-email">
        {() => <AdminProtectedRoute component={SendEmail} path="/admin/send-email" />}
      </Route>

      <Route path="/admin/AdminDashboard">
        {() => <AdminProtectedRoute component={AdminDashboard} path="/admin/AdminDashboard" />}
      </Route>

      {/*chat gpt calificar ruta para el boton que lleva a quiz-results*/}
      <Route path="/admin/quiz-results/:progressId">
        {() => <AdminProtectedRoute component={QuizResults} path="/admin/quiz-results/:progressId" />}
      </Route>
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
      <ImpersonationBanner />
      <Toaster />
    </QueryClientProvider>
  );
}


export default App;
