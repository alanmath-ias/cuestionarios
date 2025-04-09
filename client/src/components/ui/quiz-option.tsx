import { useState } from 'react';
import { MathDisplay } from './math-display';

type OptionState = 'default' | 'selected' | 'correct' | 'incorrect';

interface QuizOptionProps {
  optionLabel: string;
  content: string;
  state?: OptionState;
  disabled?: boolean;
  onClick?: () => void;
}

export function QuizOption({ 
  optionLabel, 
  content, 
  state = 'default',
  disabled = false,
  onClick 
}: QuizOptionProps) {
  
  const getStateClasses = () => {
    switch (state) {
      case 'selected':
        return 'bg-blue-50 border-primary';
      case 'correct':
        return 'bg-green-50 border-success text-success';
      case 'incorrect':
        return 'bg-red-50 border-error text-error';
      default:
        return 'hover:bg-blue-50';
    }
  };

  return (
    <div 
      className={`quiz-option border rounded-lg p-4 cursor-pointer transition-colors duration-150 ${getStateClasses()} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-start">
        <div className={`w-7 h-7 rounded-full ${state === 'default' ? 'bg-gray-100' : state === 'selected' ? 'bg-blue-100' : state === 'correct' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mr-3 border`}>
          <span className="font-medium">{optionLabel}</span>
        </div>
        <div className="math">
          <MathDisplay math={content} />
        </div>
      </div>
    </div>
  );
}
