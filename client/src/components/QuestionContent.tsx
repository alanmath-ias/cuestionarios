import { MathDisplay } from '@/components/ui/math-display';

export const QuestionContent = ({ content }: { content: string }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg text-lg">
      {content.split(/(¡.*?¡)/g).map((part, index) => {
        const trimmedPart = part.trim();
        if (trimmedPart.startsWith('¡') && trimmedPart.endsWith('¡')) {
          const equation = trimmedPart.slice(1, -1).trim();
          return (
            <span key={index} className="mx-1">
              <MathDisplay 
                math={equation} 
                display={false} 
                className="inline-block align-middle"
              />
            </span>
          );
        } else {
          return part.trim() ? <span key={index}>{part}</span> : null;
        }
      })}
    </div>
  );
};

/*SI QUEREMOS QUE ACEPTE SALTOS DE LINEA, COMO PARA VARIAS ECUACIONES POR EJEMPLO:
//Los saltos de linea aparecen en medio de la ecuacion usando \n
// client/src/components/QuestionContent.tsx
import { MathDisplay } from '@/components/ui/math-display';

interface QuestionContentProps {
  content: string;
  className?: string;
}

export const QuestionContent = ({ 
  content, 
  className = "bg-gray-50 p-4 rounded-lg text-lg" 
}: QuestionContentProps) => {
  return (
    <div className={className}>
      {content.split(/(¡[\s\S]*?¡)/g).map((part, index) => {
        const trimmedPart = part.trim();
        
        // Si es una ecuación (¡...¡)
        if (trimmedPart.startsWith('¡') && trimmedPart.endsWith('¡')) {
          const equation = trimmedPart.slice(1, -1).trim();
          
          return (
            <span key={`math-${index}`} className="mx-1">
              <MathDisplay 
                math={equation} 
                display={equation.includes('\n')} // Modo "block" si hay saltos de línea
                className="inline-block align-middle"
              />
            </span>
          );
        } 

        // Si es texto normal (no vacío)
        return trimmedPart ? (
          <span key={`text-${index}`}>{part}</span>
        ) : null;
      })}
    </div>
  );
};
*/