import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Eye, Trash2, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type QuizSubmission = {
  progress: {
    id: number;
    userId: number;
    timeSpent: number;
    score: number;
  };
  quiz: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    name: string;
  };
  completedAt: string;
  reviewed: boolean;
};

type UserGroup = {
  userId: number;
  userName: string;
  pendingCount: number;
  reviewedCount: number;
};

const Calificar = () => {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/admin/quiz-submissions", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSubmissions(data);
      } catch (err: any) {
        console.error("Error obteniendo las presentaciones de los cuestionarios:", err);
        setError("Hubo un problema al cargar las presentaciones de los cuestionarios");
      }
    };

    fetchSubmissions();
  }, []);

  const markAsReviewed = async (progressId: number) => {
    await fetch(`/api/quiz-submissions/${progressId}/reviewed`, {
      method: 'PATCH',
      credentials: 'include',
    });

    setSubmissions((prev) =>
      prev.map((s) =>
        s.progress.id === progressId ? { ...s, reviewed: true } : s
      )
    );
  };

  const handleDiscard = async (progressId: number) => {
    await fetch(`/api/quiz-submissions/${progressId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setSubmissions((prev) =>
      prev.filter((s) => s.progress && s.progress.id !== progressId)
    );
  };

  const handleBulkDiscard = async (userId: number, type: 'pending' | 'reviewed') => {
    const toDelete = submissions.filter(s =>
      s.user.id === userId && (type === 'reviewed' ? s.reviewed : !s.reviewed)
    );

    try {
      await Promise.all(toDelete.map(s =>
        fetch(`/api/quiz-submissions/${s.progress.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      ));

      setSubmissions(prev =>
        prev.filter(s =>
          !(s.user.id === userId && (type === 'reviewed' ? s.reviewed : !s.reviewed))
        )
      );
    } catch (err) {
      console.error("Error deleting submissions:", err);
      // Could add toast here
    }
  };

  // Group submissions by user
  const userGroups = submissions.reduce((acc, curr) => {
    if (!curr.user) return acc; // Skip if no user (shouldn't happen with fix)

    const existing = acc.find(u => u.userId === curr.user.id);
    if (existing) {
      if (curr.reviewed) existing.reviewedCount++;
      else existing.pendingCount++;
    } else {
      acc.push({
        userId: curr.user.id,
        userName: curr.user.name,
        pendingCount: curr.reviewed ? 0 : 1,
        reviewedCount: curr.reviewed ? 1 : 0
      });
    }
    return acc;
  }, [] as UserGroup[]);

  // Filter for detail view
  const selectedUserSubmissions = selectedUserId
    ? submissions.filter(s => s.user?.id === selectedUserId)
    : [];

  const pendingSubmissions = selectedUserSubmissions.filter(s => !s.reviewed);
  const reviewedSubmissions = selectedUserSubmissions.filter(s => s.reviewed);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          {!selectedUserId ? (
            <Link href="/admin">
              <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" onClick={() => setSelectedUserId(null)} className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          )}
          <h1 className="text-3xl font-bold text-slate-100">
            {selectedUserId ? `Calificando a: ${selectedUserSubmissions[0]?.user?.name}` : "Presentaciones de Cuestionarios"}
          </h1>
        </div>

        {error && <p className="text-red-400 mb-4 bg-red-500/10 p-4 rounded border border-red-500/20">{error}</p>}

        {!selectedUserId ? (
          // LIST VIEW
          <div className="grid gap-4">
            {userGroups.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
                <p className="text-slate-500">No hay presentaciones de cuestionarios disponibles.</p>
              </div>
            ) : (
              userGroups.map(group => (
                <Card key={group.userId} className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-900 border-white/10 hover:border-white/20 transition-all shadow-lg">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="font-semibold text-lg text-slate-200">{group.userName}</div>
                    <div className="flex gap-2 text-sm">
                      {group.pendingCount > 0 && (
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {group.pendingCount} Pendientes
                        </span>
                      )}
                      {group.reviewedCount > 0 && (
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> {group.reviewedCount} Revisadas
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedUserId(group.userId)} title="Ver detalles" className="text-slate-400 hover:text-white hover:bg-white/10">
                      <Eye className="h-5 w-5" />
                    </Button>

                    {group.reviewedCount > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300">
                            <Trash2 className="h-4 w-4 mr-2" /> Borrar Revisadas
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-100">¿Borrar todas las revisadas?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Estás a punto de eliminar {group.reviewedCount} tareas revisadas de {group.userName}. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBulkDiscard(group.userId, 'reviewed')} className="bg-red-600 hover:bg-red-700 text-white">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {group.pendingCount > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300">
                            <Trash2 className="h-4 w-4 mr-2" /> Borrar Pendientes
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-100">¿Borrar todas las pendientes?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Estás a punto de eliminar {group.pendingCount} tareas PENDIENTES de {group.userName}. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBulkDiscard(group.userId, 'pending')} className="bg-red-600 hover:bg-red-700 text-white">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          // DETAIL VIEW
          <div className="space-y-8">
            {/* Sección de pendientes */}
            {pendingSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-200">
                  <Clock className="mr-2 text-yellow-400" /> Pendientes de revisión
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingSubmissions.map((submission, index) => (
                    <Card key={`pending-${index}`} className="shadow-lg rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/5">
                      <CardContent className="p-0">
                        <div className="space-y-2 text-slate-300">
                          <p><strong className="text-slate-200">Quiz:</strong> {submission.quiz?.title || "Quiz desconocido"}</p>
                          <p><strong className="text-slate-200">Puntaje:</strong> {submission.progress ? submission.progress.score : "No disponible"}</p>
                          <p><strong className="text-slate-200">Fecha:</strong> {new Date(submission.completedAt).toLocaleString()}</p>
                          <p className="text-xs text-slate-500">ID: {submission.progress ? submission.progress.id : "N/A"}</p>
                        </div>
                        {submission.progress && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={async () => {
                                await markAsReviewed(submission.progress.id);
                                setLocation(`/admin/review/${submission.progress.id}`);
                              }}
                            >
                              Ver detalles
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDiscard(submission.progress.id)}
                              className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de revisadas */}
            {reviewedSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-200">
                  <CheckCircle className="mr-2 text-green-400" /> Revisadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviewedSubmissions.map((submission, index) => (
                    <Card key={`reviewed-${index}`} className="shadow-lg rounded-xl p-4 border border-green-500/30 bg-green-500/5">
                      <CardContent className="p-0">
                        <div className="space-y-2 text-slate-300">
                          <p><strong className="text-slate-200">Quiz:</strong> {submission.quiz?.title || "Quiz desconocido"}</p>
                          <p><strong className="text-slate-200">Puntaje:</strong> {submission.progress ? submission.progress.score : "No disponible"}</p>
                          <p><strong className="text-slate-200">Fecha:</strong> {new Date(submission.completedAt).toLocaleString()}</p>
                          <p className="text-xs text-slate-500">ID: {submission.progress ? submission.progress.id : "N/A"}</p>
                        </div>
                        {submission.progress && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              className="flex-1 bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                              onClick={() => setLocation(`/admin/review/${submission.progress.id}`)}
                            >
                              Ver detalles
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDiscard(submission.progress.id)}
                              className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pendingSubmissions.length === 0 && reviewedSubmissions.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
                <p className="text-slate-500">Este usuario no tiene presentaciones.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calificar;