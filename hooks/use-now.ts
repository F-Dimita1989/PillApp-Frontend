import { useEffect, useState } from "react";

/** Ora corrente aggiornata periodicamente (default ogni secondo). */
export function useNow(tickMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(timer);
  }, [tickMs]);

  return now;
}
