import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Youtube,
  ClipboardList,
  ListChecks,
  BadgeCheck,
  AlertOctagon,
  FileClock
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type KPIStats = {
  totalAssigned: number;
  completed: number;
  pendingReview: number;
  pendingReports: number;
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
  subcategoryId: number;
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

type StudentHistory = {
  quizId: number;
  quizTitle: string;
  score: number;
  completedAt: string;
  progressId: number;
};

const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIStats>({
    totalAssigned: 0,
    completed: 0,
    pendingReview: 0,
    pendingReports: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; youtubeLink?: string | null }[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // State for history dialog
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<StudentHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

    fetch('/api/admin/students-at-risk?limit=5')
      .then(res => res.json())
      .then(setAtRiskStudents);

    fetch('/api/admin/recent-activity?limit=10')
      .then(res => res.json())
      .then(setRecentActivity);
  }, []);

  const fetchStudentHistory = async (userId: number, subcategoryId: number) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/student-history/${userId}/${subcategoryId}`);
      const data = await res.json();
      setSelectedStudentHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-xl border border-white/10 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Cuestionarios Asignados</p>
                  <h3 className="text-3xl font-bold text-blue-400 mt-2">{kpis.totalAssigned}</h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <ClipboardList className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border border-white/10 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Completados</p>
                  <h3 className="text-3xl font-bold text-green-400 mt-2">{kpis.completed}</h3>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                  <ListChecks className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border border-white/10 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pendientes por Revisar</p>
                  <h3 className="text-3xl font-bold text-yellow-400 mt-2">{kpis.pendingReview}</h3>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                  <BadgeCheck className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/admin/reports">
            {/* Reportes Pendientes con Alarma */}
            <Card className={`shadow-xl border border-white/10 bg-slate-900/50 backdrop-blur ${kpis.pendingReports >= 10 ? 'animate-pulse border-red-500/50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${kpis.pendingReports >= 10 ? 'text-red-400' : 'text-slate-400'}`}>
                      Reportes Pendientes
                    </p>
                    <h3 className={`text-3xl font-bold mt-2 ${kpis.pendingReports >= 10 ? 'text-red-500' : 'text-slate-200'}`}>
                      {kpis.pendingReports}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-full border ${kpis.pendingReports >= 10 ? 'bg-red-500/20 border-red-500/40' : 'bg-slate-500/10 border-slate-500/20'}`}>
                    <AlertOctagon className={`w-6 h-6 ${kpis.pendingReports >= 10 ? 'text-red-500' : 'text-slate-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Requieren Atención y Pendientes */}
          <div className="lg:col-span-2 space-y-8">

            {/* Envíos Pendientes (Prioridad Alta) */}
            <Card className="border border-white/10 bg-slate-900 shadow-xl">
              <CardHeader className="pb-3 border-b border-white/5 bg-slate-900/50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-orange-400">
                  <FileClock className="w-5 h-5" />
                  Envíos Pendientes de Revisión
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10">
                  <Link href="/admin/calificar">
                    Ver todo
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {recentSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-green-500/30" />
                    <p>¡Todo al día! No hay envíos pendientes.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentSubmissions.map(sub => (
                      <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                        <div>
                          <p className="font-semibold text-slate-200">{sub.userName}</p>
                          <p className="text-sm text-slate-400">
                            Envió <span className="font-medium text-orange-400">{sub.quizTitle}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                        <Button asChild size="sm" className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20">
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
            <Card className="border border-white/10 bg-slate-900 shadow-xl">
              <CardHeader className="pb-3 border-b border-white/5 bg-slate-900/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Requieren Atención (Notas Bajas)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {atRiskStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <p className="text-sm">No se detectaron estudiantes con notas críticas recientemente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {atRiskStudents.map((student, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-red-500/5 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-sm border border-red-500/20">
                            {student.score}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{student.userName}</p>
                            <p className="text-sm text-red-400">
                              Bajo rendimiento en: {student.quizTitle}
                            </p>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-white/5"
                              onClick={() => fetchStudentHistory(student.userId, student.subcategoryId)}
                            >
                              Ver Historial
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-white/10 text-slate-200 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Historial de {student.userName}</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Detalles de los intentos del estudiante en esta evaluación.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-slate-400 mb-3">
                                Intentos en esta subcategoría:
                              </h4>
                              {isLoadingHistory ? (
                                <div className="text-center py-8 text-slate-500">Cargando historial...</div>
                              ) : selectedStudentHistory.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No hay historial disponible.</div>
                              ) : (
                                <div className="space-y-3">
                                  {selectedStudentHistory.map((history) => (
                                    <div key={history.progressId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                      <div>
                                        <p className="font-medium text-slate-200">{history.quizTitle}</p>
                                        <p className="text-xs text-slate-500">
                                          {formatDistanceToNow(new Date(history.completedAt), { addSuffix: true, locale: es })}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className={`text-sm font-bold px-2 py-1 rounded ${history.score <= 7.0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                          }`}>
                                          Nota: {history.score}
                                        </span>
                                        <Button asChild size="sm" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
                                          <Link to={`/admin/quiz-results/${history.progressId}`}>
                                            Ver Detalles
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
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
            <Card className="border border-white/10 bg-slate-900 shadow-xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-200">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentActivity.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <p>No hay actividad reciente registrada.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentActivity.map((act) => (
                      <div key={act.id} className="p-3 hover:bg-white/5 transition">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-slate-200">{act.userName}</span>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(act.completedAt), { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">
                          Completó <span className="text-slate-300 font-medium">{act.quizTitle}</span>
                        </p>
                        {act.score !== null && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${act.score >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              act.score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
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
            <Card className="border border-white/10 bg-slate-900 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-200">
                  Materias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-1">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md transition group border border-transparent hover:border-white/5">
                      <Link to={`/category/${cat.id}`} className="font-medium text-sm text-slate-300 hover:text-blue-400 flex-1 truncate mr-2" title={cat.name}>
                        {cat.name}
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        {cat.youtubeLink ? (
                          <a
                            href={cat.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver videos en YouTube"
                            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10"
                          >
                            <Youtube className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="w-7"></span>
                        )}
                        <Link
                          to={`/training/${cat.id}`}
                          title="Ir a Entrenamiento"
                          className="text-slate-500 hover:text-indigo-400 transition-colors p-1.5 rounded-md hover:bg-indigo-500/10"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link to="/admin/users">
                    <Button variant="outline" className="w-full justify-between bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-slate-700">
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
    </div>
  );
};

export default AdminDashboard;