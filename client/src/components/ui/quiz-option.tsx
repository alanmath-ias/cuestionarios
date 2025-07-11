{/*}
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

  const renderContent = () => {
    if (!content) return null;
    
    const parts = content.split('¡');
    if (parts.length === 1) return <span>{content}</span>;

    return parts.map((part, i) => (
      i % 2 === 0 ? 
        <span key={i}>{part}</span> : 
        <MathDisplay key={i} math={part.trim()} inline />
    ));
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
        <div className="quiz-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
*/}

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
        return 'bg-blue-50 border-primary border-2';
      case 'correct':
        return 'bg-emerald-50 border-emerald-500 text-emerald-700 border-2';
      case 'incorrect':
        return 'bg-red-50 border-red-500 text-red-700 border-2';
      default:
        return 'hover:bg-blue-50 border-gray-200';
    }
  };

  const renderContent = () => {
    if (!content) return null;
    
    const parts = content.split('¡');
    if (parts.length === 1) return <span>{content}</span>;

    return parts.map((part, i) => (
      i % 2 === 0 ? 
        <span key={i}>{part}</span> : 
        <MathDisplay key={i} math={part.trim()} inline />
    ));
  };

  return (
    <div 
      className={`quiz-option border rounded-lg p-4 cursor-pointer transition-colors duration-150 ${getStateClasses()} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-start">
        <div className={`w-7 h-7 rounded-full ${
          state === 'default' ? 'bg-gray-100 border-gray-300' : 
          state === 'selected' ? 'bg-blue-100 border-blue-500' : 
          state === 'correct' ? 'bg-emerald-100 border-emerald-500' : 
          'bg-red-100 border-red-500'
        } flex items-center justify-center mr-3 border`}>
          <span className={`font-medium ${
            state === 'correct' ? 'text-emerald-700' : 
            state === 'incorrect' ? 'text-red-700' : 
            'text-gray-700'
          }`}>
            {optionLabel}
          </span>
        </div>
        <div className="quiz-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}