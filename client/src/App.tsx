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
import CategoriesAdmin from "@/pages/admin/categories";
import QuestionsAdmin from "@/pages/admin/questions";
import { PageLayout } from "@/components/layout/page-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/category/:categoryId" component={QuizList} />
      <Route path="/quiz/:quizId" component={ActiveQuiz} />
      <Route path="/results/:progressId" component={QuizResults} />
      <Route path="/free-quizzes" component={FreeQuizzes} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin/categories" component={CategoriesAdmin} />
      <Route path="/admin/questions" component={QuestionsAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageLayout>
        <Router />
      </PageLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
