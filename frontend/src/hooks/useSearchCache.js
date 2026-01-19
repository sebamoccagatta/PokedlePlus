import { searchCache } from "../cache/searchCache.js";

export function useSearchCache() {
  const get = (query, mode) => searchCache.get(query, mode);
  const set = (query, mode, data) => searchCache.set(query, mode, data);
  const clear = () => searchCache.clear();

  return { get, set, clear };
}
