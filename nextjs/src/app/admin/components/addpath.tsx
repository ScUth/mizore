"use client";

import * as React from "react";
import { Button, TextField } from "@mui/material";
import CustomDialog from "../../component/dialog";
import AdminGuard from "./adminGuard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("accessToken") ?? "";
}

function decodeTokenPayload(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = window.atob(normalized + pad);
    return JSON.parse(decoded) as { id?: number };
  } catch {
    return null;
  }
}

export default function AddPathDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [path, setPath] = React.useState("");
  const [pathName, setPathName] = React.useState("");

  const resetForm = React.useCallback(() => {
    setPath("");
    setPathName("");
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const token = getStoredToken();
  const userId = decodeTokenPayload(token)?.id ?? null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPath = path.trim();
    const trimmedName = pathName.trim();

    if (!trimmedPath || !trimmedName || userId == null || !token) return; // require auth

    try {
      const response = await fetch(`${API_BASE}/api/paths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: trimmedPath,
          name: trimmedName,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create path");
      }

      handleClose();
    } catch (error) {
      console.error("Failed to add path", error);
    }
  };

  return (
      <CustomDialog
        open={open}
        onClose={handleClose}
        title={`Add Path`}
        content="Enter details for the new path."
        onSubmit={handleSubmit}
        actions={
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          label="Path"
          placeholder="e.g. /api/users or C:\\Projects\\MyPath"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Path Name"
          value={pathName}
          onChange={(event) => setPathName(event.target.value)}
          margin="normal"
          required
        />
      </CustomDialog>
  );
}
