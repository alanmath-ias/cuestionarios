import { Button } from '@/components/ui/button';
import { Rocket, BookOpen, Award, BrainCircuit, Check, AlertCircle } from 'lucide-react';
import { UsernameSetupDialog } from '@/components/dialogs/UsernameSetupDialog';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@shared/schema';

interface User {
    id: number;
    name: string;
    username: string;
    subscriptionStatus: string;
    role: string;
}

export default function WelcomePage() {
    const [_, setLocation] = useLocation();
    const { toast } = useToast();
    const [step, setStep] = useState<'subjects'>('subjects');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    // Lazy initialization for auto-assigning state to prevent flash
    const [isAutoAssigning, setIsAutoAssigning] = useState(() => {
        const pendingCategory = localStorage.getItem('pendingCategoryAssign');
        const publicQuizResults = sessionStorage.getItem('publicQuizResults');
        return !!(pendingCategory || publicQuizResults);
    });

    const { data: user, isError, isLoading: isUserLoading } = useQuery<User>({
        queryKey: ['/api/user'],
        retry: 2,
    });

    // If session is invalid (401), redirect to auth to prevent hang
    useEffect(() => {
        if (isError) {
            setLocation('/auth');
        }
    }, [isError, setLocation]);

    // Redirect parents if they land here
    useEffect(() => {
        if (user && user.role === 'parent') {
            setLocation('/parent-dashboard');
        }
    }, [user, setLocation]);

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['/api/categories'],
    });

    // Handle auto-assignment from public quiz
    // Handle auto-assignment from public quiz
    // Handle auto-assignment from public quiz
    useEffect(() => {
        const pendingCategory = localStorage.getItem('pendingCategoryAssign');
        const publicQuizResults = sessionStorage.getItem('publicQuizResults');

        const processAutoSetup = async () => {
            if (!user) return;

            // Wait until user sets their real username (if they are a Google user)
            // The UsernameSetupDialog will handle the update, triggering this effect again with the new username
            if (user.username.startsWith('google_')) return;

            // Start loading state immediately if we have data to process
            if (publicQuizResults || pendingCategory) {
                setIsAutoAssigning(true);
            }

            const startTime = Date.now();
            let categoryAssigned = false;

            // 1. Import Progress (if available)
            if (publicQuizResults) {
                try {
                    const results = JSON.parse(publicQuizResults);

                    // Fallback: If no pending category, try to get it from results
                    let targetCategoryId = pendingCategory ? parseInt(pendingCategory) : null;

                    // Import progress
                    await apiRequest('POST', '/api/user/import-progress', {
                        quizId: results.quizId,
                        score: results.score,
                        totalQuestions: results.totalQuestionsCount,
                        answers: results.answers,
                        timeSpent: results.timeSpent // Pass timeSpent if available
                    });

                    // Mapping for diagnostic quizzes to find their real subject category
                    // This overrides the generic "Test de Nivelación" category
                    const DIAGNOSTIC_QUIZ_MAPPING: Record<number, string> = {
                        278: 'aritmética',
                        279: 'álgebra',
                        280: 'geometría',
                        281: 'estadística',
                        282: 'cálculo',
                        283: 'física',
                    };

                    // If no pending category, try to find the real subject
                    if (!targetCategoryId && results.quizId) {
                        // 1. Try manual mapping for diagnostics
                        const targetName = DIAGNOSTIC_QUIZ_MAPPING[results.quizId];
                        if (targetName && categories) {
                            const match = categories.find(c => c.name.toLowerCase().includes(targetName));
                            if (match) targetCategoryId = match.id;
                        }

                        // 2. If still no category and not mapped, fetch quiz details
                        if (!targetCategoryId) {
                            try {
                                // Fetch quiz details to get category
                                const quizRes = await apiRequest('GET', `/api/quizzes/${results.quizId}`);
                                const quizData = await quizRes.json();
                                if (quizData && quizData.categoryId) {
                                    targetCategoryId = quizData.categoryId;
                                }
                            } catch (e) {
                                console.error("Could not fetch quiz details for category fallback", e);
                            }
                        }
                    }

                    // Assign category if we found one
                    if (targetCategoryId) {
                        try {
                            await apiRequest('POST', '/api/user/categories', { categoryIds: [targetCategoryId] });
                            categoryAssigned = true;
                        } catch (e) {
                            console.error("Failed to auto-assign category from fallback", e);
                        }
                    }

                    // Save recommendations for dashboard if available
                    // We do this inside here because targetCategoryId is available in this scope
                    if (results.aiDiagnosis) {
                        localStorage.setItem('pendingRecommendations', JSON.stringify({
                            diagnosis: results.aiDiagnosis,
                            categoryId: targetCategoryId,
                            timestamp: Date.now()
                        }));
                    }

                    // Clear after import
                    sessionStorage.removeItem('publicQuizResults');
                    localStorage.removeItem('pendingCategoryAssign'); // Clear this too just in case

                } catch (err) {
                    console.error("Failed to import progress", err);
                }
            }

            if (pendingCategory && !categoryAssigned) {
                try {
                    const categoryId = parseInt(pendingCategory);
                    await apiRequest('POST', '/api/user/categories', { categoryIds: [categoryId] });
                    localStorage.removeItem('pendingCategoryAssign');
                    categoryAssigned = true;
                } catch (err) {
                    console.error("Auto-assign failed", err);
                }
            }

            // Ensure minimum display time for the welcome/loading screen (3 seconds)
            const elapsedTime = Date.now() - startTime;
            const minTime = 3000;
            const remainingTime = Math.max(0, minTime - elapsedTime);

            if (categoryAssigned) {
                toast({
                    title: "¡Todo listo!",
                    description: "Hemos guardado tu progreso y asignado tu materia.",
                    className: "bg-green-600 text-white border-none duration-5000"
                });
                setTimeout(() => setLocation('/'), remainingTime);
            } else {
                // If we failed to assign anything, stop loading and let user choose
                // But don't turn off immediately if we are just waiting for the timer?
                // No, if failed, we want to show selection.
                // If success, we wait.
                setIsAutoAssigning(false);
            }
        };

        if (user && (pendingCategory || publicQuizResults)) {
            // Wait for categories to be loaded if we need to map public quiz results
            if (publicQuizResults && !categories) return;

            processAutoSetup();
        }
    }, [user, categories, setLocation, toast]);

    // Reduced useEffects to prevent race conditions/flickering
    // The initial state function handles the default step.
    // The main auto-setup effect handles the auto-assigning logic.
    // Google username check is now handled by UsernameSetupDialog component

    const saveCategoriesMutation = useMutation({
        mutationFn: async (categoryIds: number[]) => {
            await apiRequest('POST', '/api/user/categories', { categoryIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user'] });
            setLocation('/');
        },
        onError: (error: any) => {
            toast({
                title: "Límite Alcanzado",
                description: error.message || "Error al guardar materias",
                variant: "destructive"
            });
        }
    });



    const toggleCategory = (id: number) => {
        const isSelected = selectedCategories.includes(id);
        const isFreeUser = user?.subscriptionStatus !== 'active';

        if (isSelected) {
            setSelectedCategories(prev => prev.filter(c => c !== id));
        } else {
            // Limit check for free users
            if (isFreeUser && selectedCategories.length >= 1) {
                toast({
                    title: "Plan Gratuito",
                    description: "Solo puedes seleccionar 1 materia. Desmarca la actual para cambiar, o suscríbete para tener todas.",
                    variant: "destructive"
                });
                return;
            }
            setSelectedCategories(prev => [...prev, id]);
        }
    };

    if (isAutoAssigning && !user?.username?.startsWith('google_')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="text-center animate-pulse">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                    <h2 className="text-xl font-bold">Personalizando tu experiencia...</h2>
                    <p className="text-slate-400 text-sm mt-2">Asignando tu materia y guardando resultados...</p>
                </div>
            </div>
        );
    }

    const availableCategories = categories?.filter(c =>
        !c.name.toLowerCase().includes('test') &&
        !c.name.toLowerCase().includes('lenguaje')
    ) || [];

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Configura tu Aprendizaje
                    </h1>
                    <p className="text-slate-400">
                        Selecciona la materia que quieres estudiar.
                    </p>
                </div>

                {/* Username Setup Dialog (Popup for Google Users) */}
                <UsernameSetupDialog
                    isOpen={!!user?.username?.startsWith('google_')}
                    user={user}
                    onSuccess={() => { }}
                />

                {/* Step 2: Subjects by Default */}
                {/* Note: 'username' step logic has been removed as per requirement for new dialog */}


                {/* Step 2: Subjects */}
                {step === 'subjects' && (
                    <div className="space-y-8">
                        {/* Alert for Free Plan */}
                        {user?.subscriptionStatus !== 'active' && (
                            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-blue-300 font-bold text-sm">Plan Gratuito</h4>
                                    <p className="text-blue-200/70 text-sm">Solo puedes seleccionar <span className="text-white font-bold">1 materia</span> activa. Suscríbete para acceder a todo el contenido.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {availableCategories.map((cat) => {
                                const isSelected = selectedCategories.includes(cat.id);
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`
                                            cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200
                                            ${isSelected
                                                ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                                                : 'bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cat.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="bg-purple-500 rounded-full p-1">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                className={`
                                    min-w-[200px] font-bold h-12 rounded-xl transition-all
                                    ${selectedCategories.length === 0
                                        ? 'bg-slate-800 text-slate-500 hover:bg-slate-800 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 hover:scale-105'}
                                `}
                                onClick={() => saveCategoriesMutation.mutate(selectedCategories)}
                                disabled={selectedCategories.length === 0 || saveCategoriesMutation.isPending}
                            >
                                {saveCategoriesMutation.isPending
                                    ? 'Guardando...'
                                    : selectedCategories.length === 0
                                        ? 'Selecciona una materia'
                                        : 'Comenzar a Aprender'
                                }
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
