"use client";

import * as React from "react";
import { Button } from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import CustomDialog from "./dialog";
import { API_BASE } from "./constants";

export default function DeletePathDialog({
  path, onClose, onDeleted,
}: {
  path: any | null;
  onClose: () => void;
  onDeleted?: (path: any) => void;
}) {
  const { accessToken, request, removePath } = useAppContext();
  const [error, setError] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => { setError(""); }, [path]);

  const handleDelete = async () => {
    const pathId = path?.id ?? path?._id;
    if (pathId == null) return setError("This path cannot be deleted because it has no ID.");
    if (!accessToken) return setError("You must be signed in to delete a path.");

    setIsDeleting(true);
    setError("");
    try {
      const response = await request(
        `${API_BASE}/api/paths/${encodeURIComponent(String(pathId))}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Failed to delete path (${response.status}).`);
      }
      removePath(pathId);
      onDeleted?.(path);
      onClose();
    } catch (e) {
      console.error("Failed to delete path", e);
      setError(e instanceof Error ? e.message : "Failed to delete path.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CustomDialog
      open={Boolean(path)}
      onClose={() => { if (!isDeleting) onClose(); }}
      title="Delete Path"
      content={`Are you sure you want to delete "${path?.name ?? path?.path ?? "this path"}"?`}
      errorMessage={error}
      actions={
        <>
          <Button onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <></>
    </CustomDialog>
  );
}