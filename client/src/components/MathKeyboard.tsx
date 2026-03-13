import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Plus,
    Minus,
    X,
    Divide,
    Delete,
    Pi,
} from "lucide-react";

interface MathKeyboardProps {
    onInput: (value: string, offset?: number) => void;
    onDelete: () => void;
    className?: string;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({ onInput, onDelete, className }) => {
    const [isSuperscript, setIsSuperscript] = useState(false);

    const superscriptMap: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    };

    const handleKeyClick = (value: string) => {
        if (value === 'delete') {
            onDelete();
            return;
        }

        if (value === 'superscript') {
            setIsSuperscript(!isSuperscript);
            return;
        }

        // Si estamos en modo superíndice y el valor es un número, convertirlo
        let finalValue = value;
        if (isSuperscript && superscriptMap[value]) {
            finalValue = superscriptMap[value];
        }

        // Si insertamos raíz o paréntesis, colocar cursor en medio
        if (value === '√()') {
            onInput('√()', -1);
        } else if (value === '()') {
            onInput('()', -1);
        } else {
            onInput(finalValue);
        }

        // Desactivar superíndice automáticamente tras operadores o espacio (no implementado aquí pero buena idea)
        if (['+', '-', '*', '/', '='].includes(value)) {
            setIsSuperscript(false);
        }
    };

    const keys = [
        { label: <span className="flex items-center">x<small className="mb-2">□</small></span>, value: 'superscript', active: isSuperscript, special: true },
        { label: '√()', value: '√()' },
        { label: '( )', value: '()' },
        { label: 'π', value: 'π', icon: <Pi className="h-4 w-4" /> },

        { label: '7', value: '7' },
        { label: '8', value: '8' },
        { label: '9', value: '9' },
        { label: '÷', value: '/', icon: <Divide className="h-4 w-4" /> },

        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '×', value: '*', icon: <X className="h-4 w-4" /> },

        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '–', value: '-', icon: <Minus className="h-4 w-4" /> },

        { label: '0', value: '0' },
        { label: '.', value: '.' },
        { label: '=', value: '=' },
        { label: '+', value: '+', icon: <Plus className="h-4 w-4" /> },

        { label: 'x', value: 'x' },
        { label: 'y', value: 'y' },
        { label: 'Del', value: 'delete', icon: <Delete className="h-4 w-4" />, variant: 'destructive' as const },
    ];

    return (
        <div className={`grid grid-cols-4 gap-2 p-4 bg-slate-950/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl ${className}`}>
            {keys.map((key, index) => (
                <Button
                    key={index}
                    variant={key.variant || "secondary"}
                    className={`h-12 text-lg font-semibold transition-all shadow-sm active:scale-95 ${key.active
                            ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-400'
                            : key.variant === 'destructive'
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
                                : key.special
                                    ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/5'
                        }`}
                    onClick={() => handleKeyClick(key.value)}
                >
                    {key.icon || key.label}
                </Button>
            ))}
        </div>
    );
};

export default MathKeyboard;
