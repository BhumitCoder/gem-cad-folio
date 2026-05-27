import { useEffect, useState } from "react";

/**
 * Re-renders the calling component whenever Firestore data syncs to
 * localStorage (event: starlink:data-changed) or auth state changes.
 */
export function useDataRefresh() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener("starlink:data-changed", bump);
    window.addEventListener("starlink:auth-changed", bump);
    return () => {
      window.removeEventListener("starlink:data-changed", bump);
      window.removeEventListener("starlink:auth-changed", bump);
    };
  }, []);
}