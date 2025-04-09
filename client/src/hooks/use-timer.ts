import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  initialTime: number; // in seconds
  autoStart?: boolean;
  onTimeUp?: () => void;
}

export function useTimer({ initialTime, autoStart = false, onTimeUp }: UseTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now() - elapsedTime * 1000;
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
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            // Time is up
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prevTime - 1;
        });
        
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
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
  }, [isRunning, onTimeUp]);
  
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
