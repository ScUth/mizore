"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";
const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  authUser: "authUser",
};

/**
 * @typedef {{ id?: string | number, username?: string, role?: string }} AppUser
 * @typedef {{ id?: string | number, _id?: string | number, name?: string, label?: string, path?: string, allowed_subpath?: boolean }} AppPath
 * @typedef {Object} AppContextValue
 * @property {AppUser | null} user
 * @property {import("react").Dispatch<import("react").SetStateAction<AppUser | null>>} setUser
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {AppPath[]} paths
 * @property {import("react").Dispatch<import("react").SetStateAction<AppPath[]>>} setPaths
 * @property {boolean} pathsLoading
 * @property {string} pathsError
 * @property {string} currentPath
 * @property {import("react").Dispatch<import("react").SetStateAction<string>>} setCurrentPath
 * @property {(url: string, options?: RequestInit) => Promise<Response>} request
 * @property {(credentials: { username: string, password: string }) => Promise<{ user: AppUser, accessToken: string, refreshToken: string }>} login
 * @property {() => void} logout
 * @property {() => void} clearSession
 * @property {(token: string) => Promise<AppUser | null>} hydrateSession
 * @property {(userId?: string | number) => Promise<AppPath[]>} refreshPaths
 * @property {(path: AppPath) => void} upsertPath
 * @property {(pathId: string | number) => void} removePath
 */

function readStoredAuth() {
  if (typeof window === "undefined") {
    return { user: null, accessToken: "", refreshToken: "" };
  }

  try {
    const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken) ?? "";
    const refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken) ?? "";
    const rawUser = window.localStorage.getItem(STORAGE_KEYS.authUser);
    const user = rawUser ? JSON.parse(rawUser) : null;

    return { user, accessToken, refreshToken };
  } catch (error) {
    console.error("Failed to read stored session", error);
    return { user: null, accessToken: "", refreshToken: "" };
  }
}

export const AppContext = /** @type {import("react").Context<AppContextValue | null>} */ (
  createContext(null)
);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paths, setPaths] = useState([]);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [pathsError, setPathsError] = useState("");
  const [currentPath, setCurrentPath] = useState("");

  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.accessToken);
      window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
      window.localStorage.removeItem(STORAGE_KEYS.authUser);
    }

    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    setPaths([]);
    setPathsLoading(false);
    setPathsError("");
    setCurrentPath("");
  }, []);

  const request = useCallback(
    (url, options = {}) => {
      const headers = new Headers(options.headers);
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return fetch(url.startsWith("http") ? url : `${API_BASE}${url}`, {
        ...options,
        headers,
      });
    },
    [accessToken],
  );

  const hydrateSession = useCallback(
    async (token) => {
      if (typeof window === "undefined" || !token) {
        setIsLoading(false);
        return null;
      }

      try {
        const response = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            clearSession();
          } else {
            throw new Error(`Failed to verify session (${response.status})`);
          }
          return null;
        }

        const data = await response.json();
        const currentUser = data?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(currentUser));
        }

        return currentUser;
      } catch (error) {
        console.error("Failed to verify session", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession],
  );

  useEffect(() => {
    const stored = readStoredAuth();
    setUser(stored.user);
    setAccessToken(stored.accessToken);
    setRefreshToken(stored.refreshToken);

    if (stored.accessToken) {
      void hydrateSession(stored.accessToken);
    } else {
      setIsLoading(false);
    }
  }, [hydrateSession]);

  const login = useCallback(async (credentials) => {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Login failed");
    }

    const nextUser = data?.user ?? null;
    const nextAccessToken = data?.accessToken ?? "";
    const nextRefreshToken = data?.refreshToken ?? "";

    if (!nextAccessToken || !nextUser) {
      throw new Error("Login response did not include a user and access token.");
    }

    window.localStorage.setItem(STORAGE_KEYS.accessToken, nextAccessToken);
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, nextRefreshToken);
    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(nextUser));
    setUser(nextUser);
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);

    return data;
  }, []);

  const refreshPaths = useCallback(async (userId = user?.id) => {
    if (!userId) {
      setPaths([]);
      setPathsLoading(false);
      setPathsError("");
      return [];
    }

    setPathsLoading(true);
    setPathsError("");
    try {
      const response = await request(`/api/paths/${encodeURIComponent(String(userId))}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load paths (${response.status})`);
      }

      const data = await response.json();
      const nextPaths = data?.paths ?? (Array.isArray(data) ? data : []);
      setPaths(nextPaths);
      return nextPaths;
    } catch (error) {
      console.error("Failed to load paths", error);
      setPathsError(error instanceof Error ? error.message : "Failed to load paths.");
      throw error;
    } finally {
      setPathsLoading(false);
    }
  }, [request, user?.id]);

  useEffect(() => {
    if (!isLoading && user?.id && accessToken) {
      void refreshPaths().catch(() => {});
    } else if (!user || !accessToken) {
      setPaths([]);
    }
  }, [accessToken, isLoading, refreshPaths, user]);

  const upsertPath = useCallback((nextPath) => {
    setPaths((currentPaths) => {
      const nextId = nextPath.id ?? nextPath._id;
      const existingIndex = currentPaths.findIndex((path) => {
        const pathId = path.id ?? path._id;
        return nextId != null && pathId != null && String(pathId) === String(nextId);
      });

      if (existingIndex < 0) {
        return [...currentPaths, nextPath];
      }

      return currentPaths.map((path, index) =>
        index === existingIndex ? { ...path, ...nextPath } : path,
      );
    });
  }, []);

  const removePath = useCallback((pathId) => {
    setPaths((currentPaths) =>
      currentPaths.filter(
        (path) => String(path.id ?? path._id) !== String(pathId),
      ),
    );
  }, []);

  const logout = useCallback(() => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      paths,
      setPaths,
      pathsLoading,
      pathsError,
      currentPath,
      setCurrentPath,
      request,
      login,
      logout,
      clearSession,
      hydrateSession,
      refreshPaths,
      upsertPath,
      removePath,
    }),
    [
      accessToken,
      clearSession,
      currentPath,
      hydrateSession,
      isLoading,
      login,
      logout,
      paths,
      pathsError,
      pathsLoading,
      refreshPaths,
      refreshToken,
      removePath,
      request,
      upsertPath,
      user,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppProvider;
