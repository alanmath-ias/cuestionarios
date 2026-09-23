import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface AIMarkdownProps {
    content: string;
    className?: string;
}

export function AIMarkdown({ content, className }: AIMarkdownProps) {
    if (!content) return null;

    const processedContent = content
        // Step 0: Normalize legacy delimiters
        // Fix legacy block: ¡¡...!! -> ¡¡...¡¡
        .replace(/¡¡([\s\S]*?)!!/g, '¡¡$1¡¡')
        // Fix legacy inline: ¡...! -> ¡...¡ (matches legacy inline ending in !)
        .replace(/¡([^¡\n]+?)!/g, '¡$1¡')

        // Step 1: Convert $$ block math to \[...\] before anything else
        .replace(/\$\$([\s\S]*?)\$\$/g, '\\[$1\\]')

        // Step 2: Convert block math ¡¡...¡¡ to \[...\]
        .replace(/¡¡([\s\S]*?)¡¡/g, '\\[$1\\]')

        // Step 3: Handle ¡...¡ (inline, multiline, or environment math)
        .replace(/¡([\s\S]*?)¡/g, (_match, inner) => {
            const trimmed = inner.trim();
            if (!trimmed) return '';

            // If it contains LaTeX environments (cases, aligned, matrix...), render as block math
            if (/\\begin\{(?:cases|matrix|pmatrix|bmatrix|aligned|align)\}/.test(trimmed)) {
                return `\\[${trimmed}\\]`;
            }

            // Check if inner is pure plain text (no math operators or symbols, not numbers)
            const hasMath = /[\\^_=+\-<>*/]/.test(trimmed) || /^\d+(?:[.,]\d+)?$/.test(trimmed);
            if (!hasMath) {
                return trimmed; // Plain text accidentally wrapped in delimiters
            }

            return `\\(${trimmed}\\)`;
        })

        // Step 4: Convert LaTeX \[...\] to $$...$$ (block math for remark-math)
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')

        // Step 5: Convert LaTeX \(...\) to $...$ (inline math for remark-math)
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

    return (
        <div className={`prose prose-sm max-w-none w-full overflow-x-auto custom-scrollbar ${className || ''}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[ [rehypeKatex, { throwOnError: false, macros: { "\\sen": "\\sin", "\\tg": "\\tan", "\\arcsen": "\\arcsin", "\\arctg": "\\arctan" } }] ]}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}
