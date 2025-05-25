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