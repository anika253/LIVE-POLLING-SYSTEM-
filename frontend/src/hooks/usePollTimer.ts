import { useEffect, useState, useRef } from 'react';

export const usePollTimer = (initialTime: number, onExpire?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initialTimeRef = useRef<number>(initialTime);

  useEffect(() => {
    initialTimeRef.current = initialTime;
    setTimeLeft(initialTime);
  }, [initialTime]);

  const start = (serverTime?: number) => {
    if (serverTime !== undefined) {
      // Sync with server time
      setTimeLeft(serverTime);
      startTimeRef.current = Date.now();
    } else {
      startTimeRef.current = Date.now();
    }
    setIsRunning(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          if (onExpire) {
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const reset = (newTime?: number) => {
    stop();
    if (newTime !== undefined) {
      setTimeLeft(newTime);
      initialTimeRef.current = newTime;
    } else {
      setTimeLeft(initialTimeRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
    formatTime: () => formatTime(timeLeft),
  };
};

