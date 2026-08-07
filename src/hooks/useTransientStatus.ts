import { useCallback, useEffect, useRef, useState } from "react";

import { STATUS_TIMEOUT_MS } from "@/constants/app";

export function useTransientStatus(timeoutMs = STATUS_TIMEOUT_MS) {
  const [status, setStatus] = useState("");
  const timeoutRef = useRef<number | null>(null);

  const showStatus = useCallback(
    (message: string) => {
      setStatus(message);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => setStatus(""), timeoutMs);
    },
    [timeoutMs],
  );

  const clearStatus = useCallback(() => {
    setStatus("");

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { status, showStatus, clearStatus };
}
