import { useCallback } from "react";
import { searchCache } from "../cache/searchCache.js";

export function useSearchCache() {
  const get = useCallback((query, mode) => searchCache.get(query, mode), []);
  const set = useCallback((query, mode, data) => searchCache.set(query, mode, data), []);
  const clear = useCallback(() => searchCache.clear(), []);

  return { get, set, clear };
}
