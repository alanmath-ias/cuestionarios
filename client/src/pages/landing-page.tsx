import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, PlayCircle, GraduationCap, BrainCircuit, ArrowRight, Star, Calculator, BookOpen, Sigma, Atom, ChevronDown, Sparkles, Triangle, Activity, BarChart3, Layers } from "lucide-react";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function LandingPage() {
    const [_, setLocation] = useLocation();
    const [showIntroDialog, setShowIntroDialog] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

    const subjects = [
        {
            id: "arithmetic",
            title: "Aritmética",
            icon: <Calculator className="w-8 h-8 text-blue-500" />,
            description: "Bases numéricas claras: operaciones, fracciones, potencias y razonamiento básico.",
            active: true,
            quizId: 278
        },
        {
            id: "algebra",
            title: "Álgebra",
            icon: <Sigma className="w-8 h-8 text-purple-500" />,
            description: "Lenguaje del álgebra: ecuaciones, expresiones y funciones paso a paso.",
            active: true,
            quizId: 279
        },
        {
            id: "trigonometry",
            title: "Trigonometría",
            icon: <Triangle className="w-8 h-8 text-indigo-500" />,
            description: "Ángulos y funciones trigonométricas: triángulos, identidades y aplicaciones.",
            active: true,
            quizId: 280
        },
        {
            id: "calculus",
            title: "Cálculo Diferencial",
            icon: <BookOpen className="w-8 h-8 text-pink-500" />,
            description: "Cambio y variación: límites, derivadas y aplicaciones fundamentales.",
            active: true,
            quizId: 281
        },
        {
            id: "integral-calculus",
            title: "Cálculo Integral",
            icon: <Layers className="w-8 h-8 text-emerald-500" />,
            description: "Cálculo de áreas y acumulaciones: integrales y aplicaciones esenciales.",
            active: true,
            quizId: 283
        },
        {
            id: "differential-equations",
            title: "Ecuaciones Diferenciales",
            icon: <Activity className="w-8 h-8 text-orange-500" />,
            description: "Modelos con ecuaciones diferenciales: crecimiento, movimiento y sistemas.",
            active: true,
            quizId: 282
        },
        {
            id: "physics",
            title: "Física Mecánica",
            icon: <Atom className="w-8 h-8 text-cyan-500" />,
            description: "Física desde el movimiento: fuerzas, energía y modelos matemáticos.",
            active: true,
            quizId: 286
        },
        {
            id: "statistics",
            title: "Estadística",
            icon: <BarChart3 className="w-8 h-8 text-yellow-500" />,
            description: "Entender los datos: promedios, variabilidad, probabilidad y decisiones.",
            active: true,
            quizId: 285
        }
    ];

    const features = [
        {
            title: "Videos Explicativos",
            description: "Cada cuestionario viene acompañado de videos que refuerzan el aprendizaje.",
            icon: <PlayCircle className="w-10 h-10 text-red-500" />
        },
        {
            title: "Clases Virtuales",
            description: "¿Necesitas ayuda extra? Agenda clases personalizadas con expertos.",
            icon: <GraduationCap className="w-10 h-10 text-yellow-500" />
        },
        {
            title: "Potenciado por IA",
            description: "Nuestra IA detecta tus fallos y te explica cómo corregirlos al instante.",
            icon: <BrainCircuit className="w-10 h-10 text-green-500" />
        }
    ];

    const handleStartQuiz = (quizId: number) => {
        setSelectedQuizId(quizId);
        setShowIntroDialog(true);
    };

    const handleConfirmStart = () => {
        if (selectedQuizId) {
            setLocation(`/public-quiz/${selectedQuizId}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-purple-500/30">
            {/* Navbar */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-xl font-bold text-white">A</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-slate-400">
                        AlanMath
                    </span>
                </div>

                {/* Badge moved to Navbar for Desktop */}
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                    <span className="text-xs text-slate-200 font-medium">Una nueva forma inteligente de aprender matemáticas</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/auth">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                            Iniciar Sesión
                        </Button>
                    </Link>
                    <Link href="/auth?mode=register">
                        <Button className="bg-white text-slate-950 hover:bg-slate-200 font-semibold">
                            Registrarse
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-10 md:pt-16 pb-24 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Mobile Badge (only visible on small screens to keep content up) 
                            Actually user said "put in header to make text go up". On mobile header is small.
                            Let's keep it hidden on mobile hero to save space, or very small.
                            I'll omit it from Hero as requested to save space.
                        */}

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            Domina las Matemáticas <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                con claridad, enfoque y resultados reales
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl font-medium text-slate-200 max-w-4xl mx-auto mb-6 leading-relaxed">
                            Tecnología que detecta exactamente dónde fallas,
                            <br className="hidden md:block" /> expertos que te enseñan solo lo que necesitas aprender.
                        </p>

                        <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                            Deja de estudiar horas sin saber por qué no mejoras.
                            Realiza diagnósticos tipo examen, identifica tus errores reales con ayuda de IA
                            y corrígelos al instante con clases personalizadas y videoteca guiada por profesores.
                        </p>

                        {/* Segmentation */}
                        <div className="flex flex-col items-center mb-12">
                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Ideal para:</span>
                            <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-left">
                                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>Estudiantes de colegio</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>Universitarios</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>Recuperaciones, parciales y exámenes importantes</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                                onClick={() => {
                                    const element = document.getElementById('subjects-section');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                Ver mi nivel de matemáticas ahora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{
                        opacity: { delay: 1, duration: 1 },
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    onClick={() => {
                        window.scrollTo({
                            top: window.innerHeight * 0.8,
                            behavior: 'smooth'
                        });
                    }}
                >
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Desliza</span>
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                </motion.div>
            </section>

            {/* Subject Selector */}
            <section id="subjects-section" className="py-24 bg-slate-900/50 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Elige tu Desafío</h2>
                        <p className="text-slate-400">Selecciona un área para comenzar tu evaluación gratuita</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {subjects.map((subject, index) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className={`h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group ${!subject.active ? 'opacity-75' : 'shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'}`}>
                                    <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                        <div className="mb-6 p-4 rounded-2xl bg-slate-950 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-800">
                                            {subject.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-purple-400 transition-colors">{subject.title}</h3>
                                        <p className="text-slate-300 text-sm mb-6 flex-grow font-medium">
                                            {subject.description}
                                        </p>
                                        {subject.active ? (
                                            <Button
                                                className="w-full bg-blue-600 hover:bg-purple-600 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
                                                onClick={() => handleStartQuiz(subject.quizId || 0)}
                                            >
                                                Empezar Test
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" disabled className="w-full text-slate-500 bg-slate-900/50">
                                                Próximamente
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="mb-6 p-4 rounded-full bg-slate-900/80 border border-slate-800 shadow-xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">
                        ¿Listo para mejorar tus notas?
                    </h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                        Únete a miles de estudiantes que ya están dominando las matemáticas con AlanMath.
                    </p>
                    <Link href="/auth?mode=register">
                        <Button
                            size="lg"
                            className="h-16 px-10 text-xl bg-white text-slate-950 hover:bg-slate-200 font-bold rounded-full shadow-2xl shadow-white/10 hover:scale-105 transition-transform"
                        >
                            Crear Cuenta Gratis
                        </Button>
                    </Link>
                    <p className="mt-6 text-sm text-slate-500">
                        No se requiere tarjeta de crédito • Cancelación en cualquier momento
                    </p>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-sm">
                <div className="container mx-auto px-6">
                    <p>© {new Date().getFullYear()} AlanMath. Todos los derechos reservados.</p>
                </div>
            </footer>

            {/* Intro Dialog */}
            <Dialog open={showIntroDialog} onOpenChange={setShowIntroDialog}>
                <DialogContent className="bg-slate-900 border-white/10 text-slate-200 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                            ¡Descubre tu Potencial!
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 pt-2 text-base">
                            Estás a punto de iniciar un diagnóstico rápido de <strong>10 preguntas</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4" />
                                ¿Por qué hacer este test?
                            </h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <span>Identifica tus fortalezas y áreas de mejora.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <span>Obtén una ubicación precisa en tu ruta de aprendizaje.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <span>Sin presiones: el objetivo es personalizar tu estudio.</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-sm text-slate-400 italic text-center">
                            "Lo que no se mide, no se puede mejorar."
                        </p>
                    </div>

                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-blue-500/20"
                            onClick={handleConfirmStart}
                        >
                            Comenzar Diagnóstico
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-500 hover:text-slate-300"
                            onClick={() => setShowIntroDialog(false)}
                        >
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
