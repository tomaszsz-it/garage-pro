import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Initialize with undefined to prevent hydration mismatch
  const [matches, setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  // Return false during SSR/initial render to prevent hydration mismatch
  return matches ?? false;
}
