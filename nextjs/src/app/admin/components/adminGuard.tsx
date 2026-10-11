"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppContext();
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  React.useEffect(() => {
    if (!isLoading && (!accessToken || (user && !isAdmin))) {
      router.replace("/login");
    }
  }, [accessToken, isAdmin, isLoading, router, user]);

  if (isLoading || !accessToken || !user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
