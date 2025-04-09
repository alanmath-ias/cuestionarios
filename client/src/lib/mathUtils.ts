// Function to replace variables in a math expression with their values
export function replaceVariables(expression: string, variables: Record<string, number>): string {
  let result = expression;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value.toString());
  }
  return result;
}

// Function to evaluate a simple math expression
export function evaluateExpression(expression: string): number {
  try {
    // Only allow simple mathematical operations for security
    if (/[^0-9+\-*/().\s]/.test(expression)) {
      throw new Error("Invalid expression");
    }
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${expression})`)();
  } catch (error) {
    console.error("Error evaluating expression:", error);
    return NaN;
  }
}

// Function to format time in minutes:seconds
export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Function to shuffle an array (useful for randomizing answer options)
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Function to generate a random number between min and max (inclusive)
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to calculate percentage
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
