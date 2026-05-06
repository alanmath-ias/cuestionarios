import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface AIMarkdownProps {
    content: string;
    className?: string;
}

export function AIMarkdown({ content, className }: AIMarkdownProps) {
    const processedContent = content
        // Step 1: Convert $$ block math to \[...\] before anything else
        .replace(/\$\$([\s\S]*?)\$\$/g, '\\[$1\\]')

        // Step 2: Convert $ inline math $ where content looks mathematical
        // Matches $ (optional space) content (optional space) $
        // Content must start with: a LaTeX command (\text, \times...) or a digit
        // This converts AI-generated "$ 7 \text{días} $" → "\( 7 \text{días} \)"
        .replace(/\$\s*((?:\\[a-zA-Z]+|[0-9])[^$\n]*?)\s*\$/g, '\\($1\\)')

        // Step 3: Remove remaining stray $ signs (accidental AI artifacts)
        // These are $ signs at start of lines or before regular words
        .replace(/^\$/gm, '')   // $ at start of any line
        .replace(/\$/g, '')     // any remaining isolated $

        // Step 4: Convert ¡¡...¡¡ to $$...$$ (block math) - always math
        .replace(/¡¡([\s\S]*?)¡¡/g, '$$$$$1$$$$')

        // Step 5: Convert ¡...¡ to $...$ ONLY if content looks like a math expression
        // (not plain Spanish text that AI sometimes wraps with ¡...¡ by mistake)
        .replace(/¡([^¡\n]{1,80}?)¡/g, (_match, inner) => {
            const looksLikeMath = /[\\^_=+\-]/.test(inner) || /^[\s\d.,]{1,15}$/.test(inner.trim());
            return looksLikeMath ? `$${inner}$` : inner; // strip delimiters if not math
        })

        // Step 6: Convert standard LaTeX \[...\] to $$...$$ (block math)
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')

        // Step 7: Convert standard LaTeX \(...\) to $...$ (inline math)
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

    return (
        <div className={`prose prose-sm max-w-none w-full overflow-x-auto custom-scrollbar ${className || ''}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}
