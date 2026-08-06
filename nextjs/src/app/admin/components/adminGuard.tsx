"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const verifyAdmin = async () => {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        if (data?.user?.role !== "admin") {
          throw new Error("Forbidden");
        }
      } catch {
        router.replace("/login");
        return;
      }

      setReady(true);
    };

    void verifyAdmin();
  }, [router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
