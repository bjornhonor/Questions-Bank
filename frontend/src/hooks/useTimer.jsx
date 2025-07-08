// /frontend/src/hooks/useTimer.js
import { useState, useEffect, useRef } from 'react';

const useTimer = (autoStart = false) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime;
    }
  };

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stop();
    setElapsedTime(0);
    startTimeRef.current = null;
  };

  const getElapsedTime = () => {
    if (isRunning && startTimeRef.current) {
      return Date.now() - startTimeRef.current;
    }
    return elapsedTime;
  };

  const formatTime = (milliseconds = null) => {
    const timeToFormat = milliseconds !== null ? milliseconds : getElapsedTime();
    const seconds = Math.floor(timeToFormat / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedTime(Date.now() - startTimeRef.current);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    isRunning,
    elapsedTime,
    start,
    stop,
    reset,
    formatTime,
    getElapsedTime
  };
};

export default useTimer;