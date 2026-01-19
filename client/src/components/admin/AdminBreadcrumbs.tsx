import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Quiz } from "@/types/types";

const routeNameMap: Record<string, string> = {
    admin: "Admin",
    AdminDashboard: "Dashboard",
    categories: "Categorías",
    quizzes: "Cuestionarios",
    questions: "Preguntas",
    users: "Usuarios",
    calificar: "Calificar",
    review: "Revisión",
    reports: "Reportes",
    "send-email": "Enviar Correo",
    "quiz-results": "Resultados",
    subcategories: "Temas",
    urlusercategories: "Categorías por Usuario",
    RegistrarPadres: "Registrar Padres",
};

export function AdminBreadcrumbs() {
    const [location] = useLocation();
    const pathSegments = location.split("/").filter((segment) => segment);

    // Identify quiz ID from the path (e.g., /admin/quizzes/123/questions)
    const quizzesIndex = pathSegments.indexOf("quizzes");
    const quizId = quizzesIndex !== -1 && pathSegments[quizzesIndex + 1]
        ? parseInt(pathSegments[quizzesIndex + 1])
        : null;

    // Fetch quiz details if we have an ID
    const { data: quiz } = useQuery<Quiz>({
        queryKey: [`/api/quizzes/${quizId}`],
        enabled: !!quizId && !isNaN(quizId),
    });

    return (
        <div className="w-full bg-slate-950 border-b border-white/5 py-3 px-8 sticky top-0 z-10 backdrop-blur-sm bg-slate-950/90">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">
                                <Home className="h-4 w-4 text-slate-400 hover:text-blue-400 transition-colors" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-slate-600" />

                    {pathSegments.map((segment, index) => {
                        const isLast = index === pathSegments.length - 1;
                        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;

                        // Format the segment name
                        let displayName = routeNameMap[segment] || segment;

                        if (!isNaN(Number(segment))) {
                            const prev = pathSegments[index - 1];
                            if (prev === 'quizzes') {
                                // Use quiz title if available, otherwise fallback to "Cuestionario ID"
                                displayName = quiz ? quiz.title : `Cuestionario ${segment}`;
                            }
                            else if (prev === 'review') displayName = `Envío ${segment}`;
                            else if (prev === 'results') displayName = `Resultado ${segment}`;
                            else displayName = `#${segment}`;
                        }

                        const isNumeric = !isNaN(Number(segment));
                        // Disable link if it's numeric and not the last item (likely an intermediate ID without a page)
                        const isClickable = !isLast && !isNumeric;

                        return (
                            <div key={href} className="flex items-center gap-2">
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="font-medium text-blue-400">
                                            {displayName}
                                        </BreadcrumbPage>
                                    ) : isClickable ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={href} className="text-slate-400 hover:text-blue-400 transition-colors">
                                                {displayName}
                                            </Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <span className="text-slate-400 font-medium cursor-default">
                                            {displayName}
                                        </span>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator className="text-slate-600" />}
                            </div>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
