import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, PlayCircle, GraduationCap, BrainCircuit, ArrowRight, Star, Calculator, BookOpen, Sigma, Atom } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    const [_, setLocation] = useLocation();

    const subjects = [
        {
            id: "arithmetic",
            title: "Aritmética",
            icon: <Calculator className="w-8 h-8 text-blue-500" />,
            description: "Domina los fundamentos: operaciones, fracciones y más.",
            active: true,
            quizId: 278 // ID del test de nivelación de aritmética
        },
        {
            id: "algebra",
            title: "Álgebra",
            icon: <Sigma className="w-8 h-8 text-purple-500" />,
            description: "Ecuaciones, funciones y polinomios simplificados.",
            active: false
        },
        {
            id: "calculus",
            title: "Cálculo",
            icon: <BookOpen className="w-8 h-8 text-pink-500" />,
            description: "Límites, derivadas e integrales paso a paso.",
            active: false
        },
        {
            id: "physics",
            title: "Física",
            icon: <Atom className="w-8 h-8 text-cyan-500" />,
            description: "Mecánica, energía y movimiento explicados.",
            active: false
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-purple-500/30">
            {/* Navbar */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-xl font-bold text-white">A</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        AlanMath
                    </span>
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
            <section className="relative pt-20 pb-32 overflow-hidden">
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-slate-300">La nueva forma de aprender matemáticas</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                            Domina las Matemáticas <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                con el Poder de la IA
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Diagnósticos precisos, rutas de aprendizaje personalizadas y soporte 24/7.
                            Tu tutor personal inteligente que se adapta a tu ritmo.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                                onClick={() => setLocation('/quiz/278')}
                            >
                                Realizar Diagnóstico Gratis
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Link href="/auth">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    Ver Demo
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Subject Selector */}
            <section className="py-24 bg-slate-900/50 border-y border-white/5">
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
                                <Card className={`h-full bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group ${!subject.active && 'opacity-75'}`}>
                                    <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                        <div className="mb-6 p-4 rounded-2xl bg-slate-900 group-hover:scale-110 transition-transform duration-300">
                                            {subject.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{subject.title}</h3>
                                        <p className="text-slate-400 text-sm mb-6 flex-grow">
                                            {subject.description}
                                        </p>
                                        {subject.active ? (
                                            <Button
                                                className="w-full bg-slate-700 hover:bg-purple-600 transition-colors"
                                                onClick={() => setLocation(`/quiz/${subject.quizId}`)}
                                            >
                                                Empezar Test
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" disabled className="w-full text-slate-500">
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
        </div>
    );
}
