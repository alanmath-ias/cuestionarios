import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    User, 
    Sword, 
    Zap, 
    ChevronRight, 
    Trash2, 
    Loader2, 
    BookOpen,
    Trophy,
    UserMinus,
    MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AwardsDialog } from '../dashboard/AwardsDialog';
import { Category } from '@/types/types';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface FriendProfileDialogProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onChallenge: (friend: any) => void;
}

export const FriendProfileDialog: React.FC<FriendProfileDialogProps> = ({
    userId,
    isOpen,
    onClose,
    onChallenge
}) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isAwardsOpen, setIsAwardsOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    // Fetch friend's full profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: [`/api/social/profile/${userId}`],
        queryFn: async () => {
            const res = await fetch(`/api/social/profile/${userId}`);
            if (!res.ok) throw new Error("Error fetching friend profile");
            return res.json();
        },
        enabled: !!userId && isOpen
    });

    const unfriendMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/social/friends/${userId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Error al eliminar amigo");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
            toast({
                title: "Amistad terminada",
                description: "El usuario ha sido eliminado de tu lista de amigos.",
            });
            onClose();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "No se pudo eliminar al amigo.",
                variant: "destructive"
            });
        }
    });

    if (!userId) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
                <DialogContent className="max-w-md bg-slate-950/98 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <ScrollArea className="max-h-[85vh]">
                        {isLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando Perfil...</p>
                            </div>
                        ) : profile && (
                            <div className="relative">
                                {/* Header / Profile Top */}
                                <div className="p-8 pb-4 text-center space-y-4">
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                                            {profile.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    <div>
                                        <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                            {profile.user.name}
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-70">
                                            @{profile.user.username}
                                        </DialogDescription>
                                    </div>

                                    {/* Global Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-slate-900/60 p-4 rounded-3xl border border-white/5 flex flex-col items-center">
                                            <Sword className="w-6 h-6 text-red-400 mb-1" />
                                            <span className="text-2xl font-black text-white">{profile.wonDuels}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Victorias</span>
                                        </div>
                                        <div className="bg-slate-900/60 p-4 rounded-3xl border border-white/5 flex flex-col items-center">
                                            <Zap className="w-6 h-6 text-blue-400 mb-1" />
                                            <span className="text-2xl font-black text-white">{profile.user.hintCredits}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Créditos</span>
                                        </div>
                                    </div>

                                    {/* Personal Record vs Friend */}
                                    {profile.isFriend && (
                                      <div className="mt-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-4 rounded-3xl border border-white/10 flex items-center justify-between shadow-xl shadow-blue-500/5">
                                        <div className="text-left pl-2">
                                          <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Historial vs Ti</span>
                                          </div>
                                          <p className="text-2xl font-black text-white mt-1 italic tracking-tighter">
                                            <span className="text-emerald-400">{profile.personalRecord.wins}V</span> - <span className="text-rose-400">{profile.personalRecord.losses}D</span>
                                          </p>
                                        </div>
                                        <div className="pr-2">
                                          <Sword className="w-10 h-10 text-white/10 rotate-12" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex justify-center gap-3">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="rounded-2xl px-6 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 hover:border-blue-600 transition-colors"
                                            onClick={() => {
                                                onClose();
                                                setTimeout(() => {
                                                    window.dispatchEvent(new CustomEvent('open-chat', { 
                                                        detail: { 
                                                            friend: { 
                                                                id: profile.user.id, 
                                                                name: profile.user.name, 
                                                                username: profile.user.username 
                                                            } 
                                                        } 
                                                    }));
                                                }, 100);
                                            }}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Chatear
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-2xl px-6 bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all"
                                            onClick={() => {
                                                onClose();
                                                onChallenge({
                                                    id: profile.user.id,
                                                    name: profile.user.name,
                                                    username: profile.user.username
                                                });
                                            }}
                                        >
                                            <Sword className="w-4 h-4 mr-2" />
                                            Retar
                                        </Button>
                                    </div>
                                </div>

                                {/* Subjects / Category Chests */}
                                <div className="p-8 pt-4 space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <span className="h-px w-6 bg-slate-800" /> Cofres de Materias
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            {profile.assignedCategories.length > 0 ? profile.assignedCategories.map((cat: Category) => (
                                                <motion.button
                                                    key={cat.id}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setSelectedCategory(cat);
                                                        setIsAwardsOpen(true);
                                                    }}
                                                    className="w-full flex items-center justify-between p-5 rounded-[1.8rem] bg-slate-900/40 border border-white/5 hover:bg-slate-900/80 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-amber-500 group-hover:text-amber-400 transition-colors">
                                                            <Trophy className="w-5 h-5" />
                                                        </div>
                                                        <div className="text-left">
                                                            <h5 className="text-sm font-black text-white uppercase italic tracking-tight">{cat.name}</h5>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Ver Progreso</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                                                </motion.button>
                                            )) : (
                                                <div className="text-center p-8 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                                                    <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sin materias asignadas</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Unfriend Button */}
                                    <div className="pt-4">
                                        <Button
                                            variant="ghost"
                                            className="w-full rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest gap-2 py-6"
                                            onClick={() => setIsConfirmDeleteOpen(true)}
                                        >
                                            <UserMinus className="w-4 h-4" />
                                            Dejar de ser amigos
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Awards Dialog for the Friend */}
            {selectedCategory && profile && (
                <AwardsDialog 
                    isOpen={isAwardsOpen}
                    onClose={() => setIsAwardsOpen(false)}
                    category={selectedCategory}
                    quizzes={profile.allProgress || []}
                    username={profile.user.name}
                    wonDuels={profile.wonDuels}
                    hintCredits={profile.user.hintCredits}
                    isPublicView={true}
                />
            )}

            {/* Confirmation Alert */}
            <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
                <AlertDialogContent className="bg-slate-950 border-white/10 rounded-[2rem]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-white italic uppercase tracking-tighter">
                            ¿Estás seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 font-medium">
                            Esta acción eliminará a <strong>{profile?.user.name}</strong> de tu lista de amigos. Para volver a interactuar, deberás enviar una nueva solicitud.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl border-white/5 bg-slate-900 hover:bg-slate-800 text-white">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                            onClick={() => unfriendMutation.mutate()}
                        >
                            {unfriendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sí, eliminar amigo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
