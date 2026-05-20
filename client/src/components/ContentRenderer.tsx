import React from 'react';
import { MathDisplay } from '@/components/ui/math-display';

interface ContentRendererProps {
    content: string;
    className?: string;
    tight?: boolean; // Nueva propiedad para modo compacto
}

export const ContentRenderer = React.memo(function ContentRenderer({ content, className, tight = false }: ContentRendererProps) {
    if (typeof content !== 'string') return null;

    // Solo normalizamos saltos de línea si el modo 'tight' está activo
    const normalizedContent = tight ? content.replace(/\n\n+/g, '\n') : content;
    // Usamos [\s\S] para permitir que el punto coincida con saltos de línea (multilínea)
    const parts = normalizedContent.split(/((?:¡+|\\?\$+)(?:[\s\S]*?)(?:¡+|\\?\$+))/g);

    return (
        <div className={`content-renderer overflow-x-auto overflow-y-hidden custom-scrollbar ${tight ? 'leading-[1.1]' : 'leading-relaxed'} ${className}`}>
            {parts.map((part, index) => {
                const trimmedPart = part.trim();
                // Check if the part is wrapped in delimiters - use [\s\S] for multiline
                const match = trimmedPart.match(/^((?:¡+|\\?\$+))([\s\S]*?)(\1)$/);

                if (match) {
                    const [fullMatch, startDelim, equation, endDelim] = match;
                    // Ensure delimiters match
                    if (startDelim === endDelim) {
                        return (
                            <span key={index} className="mx-1 inline-block align-middle">
                                <MathDisplay
                                    math={equation.trim()}
                                    display={startDelim.length >= 2 || startDelim.includes('$$')}
                                    className="inline-block"
                                    marginClassName={tight ? 'my-1' : 'my-4'}
                                />
                            </span>
                        );
                    }
                }

                // Render regular text with line breaks
                if (!part) return null;
                return (
                    <span key={index} className="whitespace-pre-wrap">
                        {part}
                    </span>
                );
            })}
        </div>
    );
});
