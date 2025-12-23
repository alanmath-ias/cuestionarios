import { MathDisplay } from '@/components/ui/math-display';

interface ContentRendererProps {
    content: string;
    className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
    // Split by ¡...¡, ¡¡...¡¡, $...$, or $$...$$ to handle math content
    const parts = content.split(/((?:¡+|\\?\$+).*?(?:¡+|\\?\$+))/g);

    return (
        <div className={className}>
            {parts.map((part, index) => {
                const trimmedPart = part.trim();
                // Check if the part is wrapped in delimiters
                const match = trimmedPart.match(/^((?:¡+|\\?\$+))(.*?)(\1)$/);

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
}
