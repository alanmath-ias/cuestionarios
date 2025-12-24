import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
    id: number;
    name: string;
    description: string;
    colorClass: string;
}

interface UserCategoriesDialogProps {
    userId: number | null;
    username: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function UserCategoriesDialog({ userId, username, isOpen, onClose }: UserCategoriesDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    // Fetch all categories
    const { data: allCategories, isLoading: isLoadingCategories } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
        enabled: isOpen,
    });

    // Fetch user categories
    const { data: userCategories, isLoading: isLoadingUserCategories } = useQuery<Category[]>({
        queryKey: [`/api/users/${userId}/categories`],
        enabled: !!userId && isOpen,
    });

    // Sync state when data loads
    useEffect(() => {
        if (userCategories) {
            // Handle potential nested structure from Drizzle join
            const ids = userCategories.map((c: any) => c.categories?.id ?? c.id);
            setSelectedCategories(ids);
        }
    }, [userCategories, isOpen]);

    const updateCategoriesMutation = useMutation({
        mutationFn: async (categoryIds: number[]) => {
            if (!userId) throw new Error("No user selected");
            const response = await fetch(`/api/users/${userId}/categories`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryIds }),
            });
            if (!response.ok) throw new Error("Failed to update categories");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/categories`] });
            toast({
                title: "Materias actualizadas",
                description: `Las materias de ${username} han sido actualizadas.`,
            });
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudieron actualizar las materias.",
                variant: "destructive",
            });
        },
    });

    const handleToggle = (categoryId: number) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleSave = () => {
        updateCategoriesMutation.mutate(selectedCategories);
    };

    const isLoading = isLoadingCategories || isLoadingUserCategories;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] bg-slate-900 border-white/10 text-slate-200 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-slate-100">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        Gestionar Materias - {username}
                    </DialogTitle>
                    <div className="text-sm text-slate-400">
                        Selecciona las materias que deseas asignar a este usuario.
                    </div>
                </DialogHeader>

                <div className="py-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                            {allCategories?.length === 0 ? (
                                <p className="col-span-full text-center text-slate-500">No hay materias disponibles.</p>
                            ) : (
                                allCategories?.map((category) => {
                                    const isSelected = selectedCategories.includes(category.id);
                                    return (
                                        <div
                                            key={category.id}
                                            className={`
                                                cursor-pointer relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                                                ${isSelected
                                                    ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                                    : "border-white/5 bg-slate-800/30 hover:border-white/10 hover:bg-slate-800/50"
                                                }
                                            `}
                                            onClick={() => handleToggle(category.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${category.colorClass} shadow-sm ring-2 ring-white/5`} />
                                                <span className={`font-medium ${isSelected ? "text-blue-400" : "text-slate-300"}`}>
                                                    {category.name}
                                                </span>
                                            </div>

                                            <div className={`
                                                w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                                                ${isSelected ? "bg-blue-500 text-white scale-100 shadow-md shadow-blue-500/20" : "bg-slate-700/50 text-transparent scale-90"}
                                            `}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 border-t border-white/5 pt-4">
                    <Button variant="outline" onClick={onClose} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</Button>
                    <Button onClick={handleSave} disabled={updateCategoriesMutation.status === 'pending'} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                        {updateCategoriesMutation.status === 'pending' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Cambios"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
