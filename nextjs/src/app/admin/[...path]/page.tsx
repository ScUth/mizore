"use client";

import { useParams, useSearchParams } from "next/navigation";
import AdminGuard from "../components/adminGuard";
import PathContent from "../components/pathContent";

export default function AdminPathPage() {
  const params = useParams<{ path?: string[] }>();
  const searchParams = useSearchParams();
  const routePath = Array.isArray(params.path) ? params.path.join("/") : params.path ?? "";
  const selectedPath = searchParams.get("path") ?? routePath;

  return (
    <AdminGuard>
      <PathContent selectedPath={selectedPath} />
    </AdminGuard>
  );
}
