import { useCallback, useMemo, useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  const mediaQuery = useMemo(
    () => (typeof window === "undefined" ? null : window.matchMedia(query)),
    [query],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      mediaQuery?.addEventListener("change", onStoreChange);
      return () => mediaQuery?.removeEventListener("change", onStoreChange);
    },
    [mediaQuery],
  );

  const getSnapshot = useCallback(() => mediaQuery?.matches ?? false, [mediaQuery]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
