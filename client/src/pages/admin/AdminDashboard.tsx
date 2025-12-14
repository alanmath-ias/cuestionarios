import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  ClipboardList,
  ListChecks,
  Users,
  FileClock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Youtube
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

type AtRiskStudent = {
  userId: number;
  userName: string;
  quizTitle: string;
  score: number;
  completedAt: string;
};

type RecentActivity = {
  id: number;
  userId: number;
  userName: string;
  quizTitle: string;
  status: string;
  score: number | null;
  completedAt: string;
};

const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIStats>({
    totalAssigned: 0,
    completed: 0,
    pendingReview: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; youtubeLink?: string | null }[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

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

    // Nuevos endpoints
    fetch('/api/admin/students-at-risk?limit=5')
      .then(res => res.json())
      .then(setAtRiskStudents);

    fetch('/api/admin/recent-activity?limit=10')
      .then(res => res.json())
      .then(setRecentActivity);
  }, []);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cuestionarios Asignados</p>
                <h3 className="text-3xl font-bold text-blue-700 mt-2">{kpis.totalAssigned}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <h3 className="text-3xl font-bold text-green-700 mt-2">{kpis.completed}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <ListChecks className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes por Revisar</p>
                <h3 className="text-3xl font-bold text-yellow-700 mt-2">{kpis.pendingReview}</h3>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <BadgeCheck className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Requieren Atención y Pendientes */}
        <div className="lg:col-span-2 space-y-8">

          {/* Envíos Pendientes (Prioridad Alta) */}
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="pb-3 border-b bg-orange-50/30">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-orange-800">
                <FileClock className="w-5 h-5" />
                Envíos Pendientes de Revisión
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentSubmissions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-green-200" />
                  <p>¡Todo al día! No hay envíos pendientes.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentSubmissions.map(sub => (
                    <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div>
                        <p className="font-semibold text-slate-800">{sub.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          Envió <span className="font-medium text-orange-700">{sub.quizTitle}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                        <Link to={`/admin/review/${sub.progressId}`}>
                          Revisar
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estudiantes en Riesgo */}
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="pb-3 border-b bg-red-50/30">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                Requieren Atención (Notas Bajas)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {atRiskStudents.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">No se detectaron estudiantes con notas críticas recientemente.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {atRiskStudents.map((student, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-red-50/30 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">
                          {student.score}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{student.userName}</p>
                          <p className="text-sm text-red-600">
                            Bajo rendimiento en: {student.quizTitle}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/admin/users">Ver Perfil</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Columna Derecha: Actividad Reciente y Accesos Rápidos */}
        <div className="space-y-8">

          {/* Actividad Reciente */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No hay actividad reciente registrada.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="p-3 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-slate-900">{act.userName}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(act.completedAt), { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">
                        Completó <span className="text-slate-700 font-medium">{act.quizTitle}</span>
                      </p>
                      {act.score !== null && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${act.score >= 80 ? 'bg-green-100 text-green-700' :
                            act.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            Nota: {act.score}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accesos Rápidos a Materias */}
          <Card className="shadow-sm bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">
                Materias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-1">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-white rounded-md transition group border border-transparent hover:border-slate-100 hover:shadow-sm">
                    <Link to={`/category/${cat.id}`} className="font-medium text-sm text-slate-700 hover:text-blue-700 flex-1 truncate mr-2" title={cat.name}>
                      {cat.name}
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      {cat.youtubeLink ? (
                        <a
                          href={cat.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver videos en YouTube"
                          className="text-muted-foreground hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50"
                        >
                          <Youtube className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="w-7"></span>
                      )}
                      <Link
                        to={`/training/${cat.id}`}
                        title="Ir a Entrenamiento"
                        className="text-muted-foreground hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-indigo-50"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full justify-between bg-white hover:bg-slate-50">
                    Gestionar Usuarios
                    <Users className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;