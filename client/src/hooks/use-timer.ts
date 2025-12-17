import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  initialTime: number; // in seconds
  initialElapsedTime?: number; // in seconds
  autoStart?: boolean;
  onTimeUp?: () => void;
}

export function useTimer({ initialTime, initialElapsedTime = 0, autoStart = false, onTimeUp }: UseTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(Math.max(0, initialTime - initialElapsedTime));
  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedTime, setElapsedTime] = useState(initialElapsedTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    // Adjust start time based on already elapsed time
    startTimeRef.current = Date.now() - (elapsedTime * 1000);
  }, [elapsedTime]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (startTimeRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }
  }, []);

  const reset = useCallback((newTime?: number) => {
    setIsRunning(false);
    setTimeRemaining(newTime !== undefined ? newTime : initialTime);
    setElapsedTime(0);
    startTimeRef.current = null;
  }, [initialTime]);

  useEffect(() => {
    // If initialElapsedTime changes (e.g. loaded from server), update state
    if (initialElapsedTime > 0 && elapsedTime === 0) {
      setElapsedTime(initialElapsedTime);
      setTimeRemaining(Math.max(0, initialTime - initialElapsedTime));
    }
  }, [initialElapsedTime, initialTime]);

  useEffect(() => {
    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - (elapsedTime * 1000);
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentElapsed = Math.floor((now - startTimeRef.current!) / 1000);

        setElapsedTime(currentElapsed);

        const remaining = Math.max(0, initialTime - currentElapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          if (onTimeUp) {
            onTimeUp();
          }
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, initialTime, onTimeUp]);

  // Format time as mm:ss
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  return {
    timeRemaining,
    elapsedTime,
    isRunning,
    start,
    pause,
    reset,
    formattedTime
  };
}
