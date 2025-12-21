import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gamepad2, ExternalLink, Brain, Zap, Puzzle } from "lucide-react";

interface RestZoneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Game {
    title: string;
    url: string;
    category: string;
    icon: any;
    color: string;
}

const games: Game[] = [
    { title: "Level Devil", url: "https://poki.com/en/g/level-devil", category: "Plataformas / Lógica", icon: Zap, color: "text-red-500" },
    { title: "Jumping Shell", url: "https://poki.com/en/g/jumping-shell", category: "Puzzle", icon: Puzzle, color: "text-blue-500" },
    { title: "Shady Bears", url: "https://poki.com/en/g/shady-bears", category: "Puzzle / Cooperativo", icon: Brain, color: "text-amber-700" },
    { title: "Hop Warp", url: "https://poki.com/en/g/hop-warp", category: "Lógica", icon: Zap, color: "text-purple-500" },
    { title: "Jump and Hover", url: "https://poki.com/en/g/jump-and-hover", category: "Habilidad", icon: Zap, color: "text-green-500" },
    { title: "Ledge Throw", url: "https://poki.com/en/g/ledge-throw", category: "Puzzle", icon: Puzzle, color: "text-orange-500" },
    { title: "Grapple Grip", url: "https://poki.com/en/g/grapple-grip", category: "Habilidad", icon: Zap, color: "text-indigo-500" },
    { title: "Jumpossess", url: "https://poki.com/en/g/jumpossess", category: "Lógica", icon: Brain, color: "text-pink-500" },
    { title: "Rotate", url: "https://poki.com/en/g/rotate", category: "Puzzle", icon: Puzzle, color: "text-cyan-500" },
    { title: "Plactions", url: "https://poki.com/en/g/plactions", category: "Estrategia", icon: Brain, color: "text-yellow-600" },
    { title: "Upwarp", url: "https://poki.com/en/g/upwarp", category: "Lógica", icon: Zap, color: "text-emerald-500" },
    { title: "Time Clones", url: "https://poki.com/en/g/time-clones", category: "Puzzle Temporal", icon: Brain, color: "text-violet-500" },
    { title: "Return Portal", url: "https://poki.com/en/g/return-portal", category: "Puzzle", icon: Puzzle, color: "text-rose-500" },
    { title: "Portal Pusher", url: "https://poki.com/en/g/portal-pusher", category: "Lógica", icon: Brain, color: "text-sky-500" },
    { title: "Block Toggle", url: "https://poki.com/en/g/block-toggle", category: "Puzzle", icon: Puzzle, color: "text-lime-600" },
    { title: "Big Tall Small", url: "https://poki.com/en/g/big-tall-small", category: "Lógica", icon: Brain, color: "text-fuchsia-500" },
    { title: "Blockins", url: "https://poki.com/en/g/blockins", category: "Puzzle", icon: Puzzle, color: "text-teal-500" },
    { title: "Sides of Gravity", url: "https://poki.com/en/g/sides-of-gravity", category: "Física", icon: Zap, color: "text-indigo-600" },
    { title: "Jumping Clones", url: "https://poki.com/en/g/jumping-clones", category: "Habilidad", icon: Zap, color: "text-orange-600" },
    { title: "Factory Balls Forever", url: "https://poki.com/en/g/factory-balls-forever", category: "Creatividad", icon: Brain, color: "text-blue-600" },
];

export function RestZoneDialog({ open, onOpenChange }: RestZoneDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
                <DialogHeader className="p-6 pb-2 bg-white/50 backdrop-blur-sm border-b border-teal-100/50">
                    <DialogTitle className="flex items-center gap-3 text-2xl text-teal-800">
                        <Gamepad2 className="w-8 h-8 text-teal-600" />
                        Zona de Descanso
                    </DialogTitle>
                    <DialogDescription className="text-teal-700/80 text-base">
                        ¡Tómate un respiro! Aquí tienes una selección de juegos para relajar la mente y estimular tu creatividad.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {games.map((game, index) => (
                            <a
                                key={index}
                                href={game.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col bg-white rounded-xl p-4 border border-teal-100 shadow-sm hover:shadow-md hover:border-teal-300 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-teal-50 transition-colors ${game.color}`}>
                                        <game.icon className="w-6 h-6" />
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                                </div>

                                <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors mb-1">
                                    {game.title}
                                </h3>
                                <p className="text-xs font-medium text-gray-500 mb-4 bg-gray-100 inline-block px-2 py-1 rounded-md self-start">
                                    {game.category}
                                </p>

                                <Button
                                    size="sm"
                                    className="w-full mt-auto bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200"
                                >
                                    Jugar ahora
                                </Button>
                            </a>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
