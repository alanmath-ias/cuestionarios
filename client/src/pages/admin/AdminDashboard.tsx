// client/src/pages/admin/AdminDashboard.tsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react'; // Para Lucide Icons
// o
import { FaYoutube } from 'react-icons/fa'; // Para Font Awesome
import {
  BadgeCheck,
  ClipboardList,
  ListChecks,
  ChevronRight,
  Users,
  FileClock,
  UserCircle2,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type KPIStats = {
  totalAssigned: number;
  completed: number;
  pendingReview: number;
};

type Submission = {
  id: number;
  userName: string;
  quizTitle: string;
  submittedAt: string;
  progressId: string;
};

type UserProgress = {
  userId: number;
  name: string;
  assigned: number;
  completed: number;
  pending: number;
};

const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIStats>({
    totalAssigned: 0,
    completed: 0,
    pendingReview: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; youtubeLink?: string | null }[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    fetch('/api/admin/dashboard-kpis')
      .then(res => res.json())
      .then(setKpis);

    fetch('/api/admin/recent-pending-submissions')
      .then(res => res.json())
      .then(setRecentSubmissions);

    fetch('/api/user/categories')
      .then(res => res.json())
      .then(setCategories);

    fetch('/api/admin/user-progress-summary')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUserProgress(data);
      });
  }, []);

  return (
    <div className="p-6 space-y-10">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border-blue-100">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3 text-blue-600">
              <ClipboardList className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Cuestionarios asignados</h3>
            </div>
            <p className="text-4xl font-bold text-blue-800">{kpis.totalAssigned}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-green-100">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3 text-green-600">
              <ListChecks className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Completados</h3>
            </div>
            <p className="text-4xl font-bold text-green-800">{kpis.completed}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-yellow-100">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-3 text-yellow-600">
              <BadgeCheck className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Pendientes por revisar</h3>
            </div>
            <p className="text-4xl font-bold text-yellow-700">{kpis.pendingReview}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de estudiantes */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" /> Progreso de estudiantes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userProgress.length === 0 ? (
            <p className="text-muted-foreground">No hay progreso de estudiantes disponible.</p>
          ) : (
            userProgress
              .filter(user => user.assigned !== 0)
              .map(user => (
                <Card 
                  key={user.userId} 
                  className={`shadow-sm hover:shadow-md transition ${
                    user.pending > 0 
                      ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                      : 'border-green-200 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <UserCircle2 className="w-5 h-5" />
                        <p className={user.pending > 0 ? 'text-red-800' : 'text-green-800'}>{user.name}</p>
                      </div>
                      {user.pending > 0 ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      user.pending > 0 ? 'text-red-700' : 'text-green-700'
                    }`}>
                      Asignados: <strong>{user.assigned}</strong> · Completados: <strong>{user.completed}</strong> · Pendientes: <strong>{user.pending}</strong>
                    </p>
                    {user.pending === 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>Todos los cuestionarios completados</span>
                      </div>
                    )}
                    {user.pending > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        <span>Cuestionarios pendientes</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Últimos envíos pendientes */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <FileClock className="w-5 h-5 text-orange-600" /> Últimos envíos pendientes de revisión
        </h2>
        <div className="space-y-3">
          {recentSubmissions.length === 0 ? (
            <p className="text-muted-foreground">No hay envíos pendientes.</p>
          ) : (
            recentSubmissions.map(sub => (
              <Card key={sub.id} className="border-orange-200 hover:shadow-md transition">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <p className="font-medium text-orange-700">{sub.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {sub.quizTitle} — enviado el{' '}
                      <span className="font-medium">{new Date(sub.submittedAt).toLocaleString()}</span>
                    </p>
                  </div>
                  <Button asChild variant="secondary" className="text-orange-700 border-orange-500 hover:bg-orange-50">
                    <Link to={`/admin/review/${sub.progressId}`}>
                      <FileText className="w-4 h-4 mr-1" />
                      Revisar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

{/* Vista de categorías */}
<div>
  <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
    <ClipboardList className="w-5 h-5 text-indigo-600" />Materias disponibles
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {categories.map(category => (
      <Card key={category.id} className="hover:shadow-md transition">
        <CardContent className="p-4 space-y-2">
          <p className="text-lg font-semibold text-indigo-700">{category.name}</p>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={`/category/${category.id}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center justify-center font-semibold border-indigo-500 text-indigo-700"
                >
                  Ver cuestionarios
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/training/${category.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  Entrenamiento
                </Button>
              </Link>
            </div>
            {/* Botón de YouTube con nuevo estilo */}
            {category.youtubeLink && (
              <a
                href={category.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold">
                  <Youtube className="w-5 h-5" />
                  YouTube VIDEOS
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
    </div>
  );
};

export default AdminDashboard;