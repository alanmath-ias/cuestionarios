import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search, User, FileText, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Simple debounce hook implementation
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

interface GlobalSearchProps {
    isAdmin: boolean;
}

export function GlobalSearch({ isAdmin }: GlobalSearchProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounceValue(query, 300);
    const [_, navigate] = useLocation();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    // Queries
    const { data: userResults, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['/api/admin/search/users', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2 || !isAdmin) return [];
            const res = await fetch(`/api/admin/search/users?q=${encodeURIComponent(debouncedQuery)}`);
            if (!res.ok) throw new Error('Failed to search users');
            return res.json();
        },
        enabled: isAdmin && debouncedQuery.length >= 2,
    });

    const { data: quizResults, isLoading: isLoadingQuizzes } = useQuery({
        queryKey: ['/api/search/quizzes', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return [];
            const res = await fetch(`/api/search/quizzes?q=${encodeURIComponent(debouncedQuery)}`);
            if (!res.ok) throw new Error('Failed to search quizzes');
            return res.json();
        },
        enabled: debouncedQuery.length >= 2,
    });

    const isLoading = isLoadingUsers || isLoadingQuizzes;
    const hasResults = (userResults?.length > 0) || (quizResults?.length > 0);

    const handleSelect = (type: 'user' | 'quiz', id: number) => {
        setIsExpanded(false);
        setQuery('');
        if (type === 'user') {
            // Navigate to users page with highlight param
            navigate(`/admin/users?highlight=${id}`);
        } else {
            navigate(`/quiz/${id}`);
        }
    };

    return (
        <div className="relative flex items-center justify-end" ref={containerRef}>
            <div className={cn(
                "flex items-center transition-all duration-300 ease-in-out bg-white/10 rounded-full overflow-hidden",
                isExpanded ? "w-64 md:w-80 bg-white" : "w-10 h-10 bg-transparent hover:bg-white/10"
            )}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-10 w-10 shrink-0 rounded-full", isExpanded ? "text-slate-500 hover:text-slate-700 hover:bg-transparent" : "text-white")}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Search className="h-5 w-5" />
                </Button>

                {isExpanded && (
                    <div className="flex-1 pr-2 relative">
                        <Input
                            ref={inputRef}
                            type="search"
                            placeholder={isAdmin ? "Buscar estudiante o cuestionario..." : "Buscar cuestionario..."}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9 text-slate-900 placeholder:text-slate-400"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isLoading && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isExpanded && query.length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-xl border border-slate-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                    {!hasResults && !isLoading ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                            No se encontraron resultados.
                        </div>
                    ) : (
                        <>
                            {isAdmin && userResults?.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50">
                                        Estudiantes
                                    </div>
                                    {userResults.map((user: any) => (
                                        <button
                                            key={`user-${user.id}`}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                            onClick={() => handleSelect('user', user.id)}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {quizResults?.length > 0 && (
                                <div>
                                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50">
                                        Cuestionarios
                                    </div>
                                    {quizResults.map((quiz: any) => (
                                        <button
                                            key={`quiz-${quiz.id}`}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                            onClick={() => handleSelect('quiz', quiz.id)}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{quiz.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{quiz.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
