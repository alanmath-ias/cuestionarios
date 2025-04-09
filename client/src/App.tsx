import { Switch, Route } from "wouter";
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
import QuestionsAdmin from "@/pages/admin/questions";
import { PageLayout } from "@/components/layout/page-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/shared/types";

function ProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: true,
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return user ? <Component {...rest} /> : <AuthPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        {(params) => <ProtectedRoute component={Dashboard} path="/" />}
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
        {(params) => <ProtectedRoute component={ProfilePage} path="/profile" />}
      </Route>
      <Route path="/admin/categories">
        {(params) => <ProtectedRoute component={CategoriesAdmin} path="/admin/categories" />}
      </Route>
      <Route path="/admin/questions">
        {(params) => <ProtectedRoute component={QuestionsAdmin} path="/admin/questions" />}
      </Route>
      <Route path="/free-quizzes" component={FreeQuizzes} />
      <Route component={NotFound} />
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
