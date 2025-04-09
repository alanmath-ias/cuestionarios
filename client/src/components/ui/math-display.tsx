import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathDisplayProps {
  math: string;
  display?: boolean;
  className?: string;
}

export function MathDisplay({ math, display = false, className = '' }: MathDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          throwOnError: false,
          displayMode: display,
        });
      } catch (error) {
        console.error('Error rendering math:', error);
        // Fallback to plain text if rendering fails
        if (containerRef.current) {
          containerRef.current.textContent = math;
        }
      }
    }
  }, [math, display]);

  return (
    <div 
      ref={containerRef} 
      className={`math ${display ? 'block my-4' : 'inline'} ${className}`}
    />
  );
}

// For cases where you want to wrap text with inline math
export function MathText({ children, className = '' }: { children: string, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Automatically searches for $...$ delimiters and renders math
      try {
        // Basic regex to match $...$ patterns
        const mathRegex = /\$(.*?)\$/g;
        let content = children;
        let match;
        let lastIndex = 0;
        const fragments = [];

        // Find all math expressions
        while ((match = mathRegex.exec(content)) !== null) {
          // Add text before the math
          if (match.index > lastIndex) {
            const textNode = document.createTextNode(content.substring(lastIndex, match.index));
            fragments.push(textNode);
          }

          // Create span for the math
          const mathSpan = document.createElement('span');
          katex.render(match[1], mathSpan, {
            throwOnError: false,
            displayMode: false,
          });
          fragments.push(mathSpan);

          lastIndex = match.index + match[0].length;
        }

        // Add any remaining text
        if (lastIndex < content.length) {
          const textNode = document.createTextNode(content.substring(lastIndex));
          fragments.push(textNode);
        }

        // Clear the container and add all fragments
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          fragments.forEach(fragment => {
            containerRef.current?.appendChild(fragment);
          });
        }
      } catch (error) {
        console.error('Error rendering math text:', error);
        // Fallback
        if (containerRef.current) {
          containerRef.current.textContent = children;
        }
      }
    }
  }, [children]);

  return <div ref={containerRef} className={className} />;
}
