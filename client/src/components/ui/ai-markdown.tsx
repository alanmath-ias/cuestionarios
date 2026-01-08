import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface AIMarkdownProps {
    content: string;
    className?: string;
}

export function AIMarkdown({ content, className }: AIMarkdownProps) {
    // Pre-process content to convert various math delimiters to standard LaTeX
    // 1. Convert ¡...¡ to $...$ (inline)
    // 2. Convert \[...\] to $$...$$ (block)
    // 3. Convert \(...\) to $...$ (inline)
    // 4. Convert ¡¡...¡¡ to $$...$$ (block - just in case)
    const processedContent = content
        .replace(/¡¡([\s\S]*?)¡¡/g, '$$$$$1$$$$') // Block math with ¡¡...¡¡
        .replace(/¡¡([\s\S]*?)!!/g, '$$$$$1$$$$') // Block math with ¡¡...!! (legacy)
        .replace(/¡([\s\S]*?)¡/g, '$$$1$$')       // Inline math with ¡...¡
        .replace(/¡([\s\S]*?)!/g, '$$$1$$')       // Inline math with ¡...! (legacy)
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$') // Block math with \[ \]
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');    // Inline math with \( \)

    return (
        <div className={`prose prose-sm max-w-none ${className || ''}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}
