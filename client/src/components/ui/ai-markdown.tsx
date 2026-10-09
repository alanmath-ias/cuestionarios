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
        // Step 0A: Desarmar exclamaciones gramaticales en español (ej: ¡Atención! o ¡No sumes raíces!)
        // para que no consuman delimitadores matemáticos de apertura
        .replace(/¡([A-Za-zÁÉÍÓÚáéíóúñÑ¿][^¡\n]*?!(?!¡))/g, '$1')

        // Step 0B: Corregir error común de tipeo \! pegado al delimitador de cierre (ej: ¡x_0 = 2\!¡ -> ¡x_0 = 2¡)
        .replace(/\\!¡/g, '¡')

        // Step 1: Normalizar bloques matemáticos $$...$$ y ¡¡...¡¡ con separación limpia
        .replace(/\$\$([\s\S]*?)\$\$/g, (_match, inner) => `\n\n\\[${inner.trim()}\\]\n\n`)
        .replace(/¡¡([\s\S]*?)¡¡/g, (_match, inner) => `\n\n\\[${inner.trim()}\\]\n\n`)

        // Step 2: Procesar expresiones ¡...¡ (inline o entornos multilínea)
        .replace(/¡([\s\S]*?)¡/g, (_match, inner) => {
            const trimmed = inner.trim();
            if (!trimmed) return '';

            // Si contiene entornos de LaTeX (cases, matrix, aligned...) o saltos \\, renderizar como bloque
            if (/\\begin\{(?:cases|matrix|pmatrix|bmatrix|aligned|align)\}/.test(trimmed) || trimmed.includes('\\\\')) {
                return `\n\n\\[${trimmed}\\]\n\n`;
            }

            // Si es accidentalmente texto en español largo sin operadores ni números, dejar como texto
            const words = trimmed.split(/\s+/);
            const hasMathSymbols = /[\\^_=+\-<>*/0-9()[\]{}:,]/.test(trimmed);
            if (words.length >= 3 && !hasMathSymbols) {
                return trimmed;
            }

            return `\\(${trimmed}\\)`;
        })

        // Step 3: Convertir a formato nativo de remark-math ($$ para display, $ para inline)
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
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
