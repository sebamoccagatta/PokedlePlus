import { useCallback, useEffect, useState } from "react";
import {
  computeLocalMetrics,
  getRecentTrackedEvents,
  getTrackedEvents,
  METRICS_STORAGE_KEY,
  METRICS_UPDATED_EVENT,
} from "../utils/localMetrics.js";

function buildSnapshot() {
  const events = getTrackedEvents();
  return {
    summary: computeLocalMetrics(events),
    recentEvents: getRecentTrackedEvents(5),
  };
}

export function useLocalMetrics() {
  const [snapshot, setSnapshot] = useState(() => buildSnapshot());

  const refresh = useCallback(() => {
    setSnapshot(buildSnapshot());
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key !== METRICS_STORAGE_KEY) return;
      refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(METRICS_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(METRICS_UPDATED_EVENT, refresh);
    };
  }, [refresh]);

  return {
    localMetrics: snapshot.summary,
    recentMetricEvents: snapshot.recentEvents,
    refreshLocalMetrics: refresh,
  };
}
