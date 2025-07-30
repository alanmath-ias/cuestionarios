// client/src/pages/FeedbackCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedbackCardProps {
  content: string;
}

// Función para limpiar el contenido
function formatearFeedback(feedback: string): string {
  return feedback
    .replace(/\*\*/g, "") // Quita los asteriscos dobles
    .split("\n")
    .map(line => {
      // Si la línea comienza con un emoji o guion (subitem), indentamos con tab
      if (/^([🔍📚✨🎯🧩🏠⏳🤝🏫📉🕒🍷💡]|[-–•])/.test(line.trim())) {
        return "\t" + line;
      }
      return line;
    })
    .join("\n");
}

export default function FeedbackCard({ content }: FeedbackCardProps) {
  const textoFormateado = formatearFeedback(content);

  return (
    <Card className="max-w-3xl mx-auto bg-white text-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">🧠 Sugerencias Personalizadas</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="whitespace-pre-line leading-relaxed text-sm">
            {textoFormateado}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
