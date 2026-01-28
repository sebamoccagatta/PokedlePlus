import { useState, useEffect, useRef, useCallback } from "react";
import { apiSearch } from "../api.js";

export function usePokemonSearch(mode, t, setError, clearCache) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchAbortRef = useRef(null);

  const doSearch = useCallback(async (nextQ, nextOffset = 0, append = false) => {
    const query = String(nextQ || "").trim();
    if (!query) {
      setResults([]);
      setOffset(0);
      setHasMore(false);
      return;
    }

    if (!append) {
      try {
        searchAbortRef.current?.abort();
      } catch {}
      searchAbortRef.current = new AbortController();
    }

    try {
      if (append) setLoadingMore(true);
      else setSearching(true);

      const res = await apiSearch(query, nextOffset, mode || "classic", {
        signal: searchAbortRef.current?.signal,
      });

      if (append) {
        setResults((prev) => [...prev, ...(res.items || [])]);
      } else {
        setResults(res.items || []);
      }

      setHasMore(Boolean(res.hasMore));
      setOffset(Number(res.nextOffset || 0));
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error(e);
      setError(t("game.search_error"));
    } finally {
      if (append) setLoadingMore(false);
      else setSearching(false);
    }
  }, [mode, setError, t]);

  useEffect(() => {
    if (!mode) return;
    const timer = setTimeout(() => {
      doSearch(q, 0, false);
    }, 80);
    return () => clearTimeout(timer);
  }, [q, mode, doSearch]);

  const handleQueryChange = useCallback((val) => {
    setQ(val);
    setSelected(null);
  }, []);

  const handlePick = useCallback((item) => {
    setSelected(item);
    setResults([]);
    setHasMore(false);
    setOffset(0);
    setQ("");
  }, []);

  const resetSearch = useCallback(() => {
    clearCache?.();
    setQ("");
    setResults([]);
    setSelected(null);
    setOffset(0);
    setHasMore(false);
    setLoadingMore(false);
  }, [clearCache]);

  useEffect(() => {
    resetSearch();
  }, [mode, resetSearch]);

  const handleScrollBottom = useCallback(() => {
    if (!hasMore || loadingMore) return;
    doSearch(q, offset, true);
  }, [hasMore, loadingMore, doSearch, q, offset]);

  return {
    q,
    results,
    selected,
    hasMore,
    loadingMore,
    searching,
    handleQueryChange,
    handlePick,
    handleScrollBottom,
    setSelected,
    setResults,
    setHasMore,
    setOffset,
    setQ
  };
}
