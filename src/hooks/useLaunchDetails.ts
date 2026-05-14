import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Launch } from "../@types/launch";
import { LAUNCH_ERROR_MESSAGES } from "../constants/launchMessages";
import { getLaunchById } from "../services/launchService";
import { useLaunchStore } from "../store/launchStore";

export function useLaunchDetails(id: string) {
  const cachedLaunch = useLaunchStore((state) => state.launchDetailsById[id]);
  const setLaunchDetail = useLaunchStore((state) => state.setLaunchDetail);
  const [launch, setLaunch] = useState<Launch | null>(cachedLaunch ?? null);
  const [loading, setLoading] = useState(!cachedLaunch);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const fetchLaunch = useCallback(async () => {
    if (cachedLaunch) {
      setLaunch(cachedLaunch);
      setLoading(false);
      setError(null);
      setEmptyMessage(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLaunch(null);
    setLoading(true);
    setError(null);
    setEmptyMessage(null);

    const canUpdate = () =>
      isMountedRef.current && requestId === requestIdRef.current;

    try {
      const data = await getLaunchById(id);
      if (!canUpdate()) return;
      setLaunchDetail(data);
      setLaunch(data);
    } catch (requestError) {
      if (!canUpdate()) return;

      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 404
      ) {
        setEmptyMessage(LAUNCH_ERROR_MESSAGES.notFound);
        return;
      }

      setError(LAUNCH_ERROR_MESSAGES.details);
    } finally {
      if (!canUpdate()) return;
      setLoading(false);
    }
  }, [cachedLaunch, id, setLaunchDetail]);

  useEffect(() => {
    fetchLaunch();
  }, [fetchLaunch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    launch,
    loading,
    error,
    emptyMessage,
    fetchLaunch,
  };
}
