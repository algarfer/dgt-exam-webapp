import { useEffect, useRef, useState } from "react";

export function useStopwatch(running: boolean): number {
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    startedAt.current ??= Date.now();
    const started = startedAt.current;

    const tick = () => setSeconds(Math.floor((Date.now() - started) / 1000));
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  return seconds;
}

export function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
