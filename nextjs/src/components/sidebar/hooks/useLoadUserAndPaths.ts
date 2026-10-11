import * as React from "react";
import { useAppContext } from "@/context/AppContext";
import { API_BASE } from "../constants";

export function useLoadUserAndPaths() {
  const { accessToken, request, setUser, setPaths } = useAppContext();

  React.useEffect(() => {
    const load = async () => {
      if (!accessToken) {
        setUser(null);
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        const response = await request(`${API_BASE}/api/me`, { headers });
        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        const userId = data?.user?.id || data?.id || undefined;

        setUser(
          data?.user ?? {
            id: userId,
            username: data?.username ?? "Guest",
            role: data?.role ?? "user",
          },
        );

        if (!userId) return;

        try {
          const pResp = await request(`${API_BASE}/api/paths/${userId}`, { headers });
          if (pResp.ok) {
            const pData = await pResp.json();
            setPaths(pData?.paths || (Array.isArray(pData) ? pData : []));
          } else {
            setPaths([]);
          }
        } catch (err) {
          console.error("Failed to load /api/paths/:id", err);
          setPaths([]);
        }
      } catch (error) {
        console.error("Failed to load /api/me", error);
        setUser(null);
      }
    };

    void load();
  }, [accessToken, request, setPaths, setUser]);
}