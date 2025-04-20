// client/src/components/QuestionContent.tsx
import { MathDisplay } from '@/components/ui/math-display'; // Asegúrate de que esta importación sea correcta

export const QuestionContent = ({ content }: { content: string }) => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-lg">
        {content.split(/(\*.*?\*)/g).map((part, index) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            // Es una ecuación (elimina los asteriscos)
            const equation = part.slice(1, -1);
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
            // Es texto normal (agrega espacio si no está vacío)
            return part.trim() ? <span key={index}>{part} </span> : null;
          }
        })}
      </div>
    );
  };