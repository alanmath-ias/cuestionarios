import React from 'react';
import { getNodeMeta, getSubjectColor } from '@/lib/quiz-node-lookup';

export interface QuizBreadcrumbProps {
    categoryName?: string | null;
    subcategoryId?: number | string | null;
    className?: string;
}

export function QuizBreadcrumb({ categoryName, subcategoryId, className = "" }: QuizBreadcrumbProps) {
    const id = typeof subcategoryId === 'string' ? parseInt(subcategoryId, 10) : subcategoryId;
    const meta = getNodeMeta(id);
    const subject = categoryName || meta?.subject;

    if (!subject && !meta) return null;

    const subjectColor = getSubjectColor(subject);

    return (
        <div className={`flex items-center gap-1.5 mb-1 flex-wrap ${className}`}>
            {subject && (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${subjectColor}`}>
                    {subject}
                </span>
            )}
            {meta?.unit && (
                <>
                    <span className="text-slate-600 text-[10px] select-none font-normal">›</span>
                    <span className="text-[10px] font-medium text-amber-400">
                        {meta.unit}
                    </span>
                </>
            )}
            {meta?.topic && (
                <>
                    <span className="text-slate-600 text-[10px] select-none font-normal">›</span>
                    <span className="text-[10px] font-medium text-emerald-400">
                        {meta.topic}
                    </span>
                </>
            )}
        </div>
    );
}
