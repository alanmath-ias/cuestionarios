import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Search, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
}

export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-slate-900/50 p-1">
                    <img
                        src={src}
                        alt={alt}
                        className={className || "max-h-60 object-contain rounded w-full"}
                    />
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex flex-col items-center justify-center pointer-events-none z-10">
                        <div className="bg-slate-900/95 p-3 rounded-full border border-white/20 backdrop-blur-md shadow-2xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 flex flex-col items-center gap-1">
                            <Search className="w-6 h-6 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Clic para ampliar</span>
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-slate-950/90 border-white/10 backdrop-blur-xl group/dialog">
                <div className="relative w-full h-full min-h-[60vh] flex flex-col items-center justify-center p-4">
                    <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={5}
                        centerOnInit={true}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <React.Fragment>
                                {/* Controles: Solo aparecen al pasar el mouse por el diálogo */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/90 p-2 rounded-full border border-white/20 backdrop-blur-md shadow-2xl opacity-0 group-hover/dialog:opacity-100 transition-all duration-300 translate-y-2 group-hover/dialog:translate-y-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => zoomIn()}
                                        className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                                        title="Aumentar"
                                    >
                                        <ZoomIn className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => zoomOut()}
                                        className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                                        title="Disminuir"
                                    >
                                        <ZoomOut className="h-5 w-5" />
                                    </Button>
                                    <div className="w-px h-6 bg-white/10 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => resetTransform()}
                                        className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
                                        title="Restablecer"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                                    <TransformComponent
                                        wrapperStyle={{ width: "100%", height: "100%", maxHeight: "80vh" }}
                                        contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="max-w-full max-h-full object-contain pointer-events-none select-none"
                                        />
                                    </TransformComponent>
                                </div>
                            </React.Fragment>
                        )}
                    </TransformWrapper>

                    <div className="absolute top-6 left-6 text-slate-400 text-sm font-medium pointer-events-none bg-slate-950/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md opacity-0 group-hover/dialog:opacity-100 transition-opacity duration-300">
                        Zoom: Gira la rueda o pellizca | Pan: Arrastra
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
