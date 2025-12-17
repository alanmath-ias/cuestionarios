import { MathDisplay } from '@/components/ui/math-display';

interface ContentRendererProps {
    content: string;
    className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
    // Split by ¡...¡ or ¡¡...¡¡ to handle math content
    // This regex matches content surrounded by one or more ¡ characters
    const parts = content.split(/(¡+.*?¡+)/g);

    return (
        <div className={className}>
            {parts.map((part, index) => {
                const trimmedPart = part.trim();
                // Check if the part is wrapped in ¡ or ¡¡
                const match = trimmedPart.match(/^(¡+)(.*?)(¡+)$/);

                if (match) {
                    const [fullMatch, startDelim, equation, endDelim] = match;
                    // Ensure delimiters match and are valid (¡ or ¡¡)
                    if (startDelim === endDelim && (startDelim === '¡' || startDelim === '¡¡')) {
                        return (
                            <span key={index} className="mx-1 inline-block align-middle">
                                <MathDisplay
                                    math={equation.trim()}
                                    display={false}
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
