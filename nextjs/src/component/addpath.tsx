"use client";

import * as React from "react";
import { Button, FormControlLabel, Switch, TextField } from "@mui/material";
import CustomDialog from "./dialog";
// import AdminGuard from "../app/admin/components/adminGuard";

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
  pathToEdit = null,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  pathToEdit?: {
    id?: string | number;
    _id?: string | number;
    name?: string;
    path?: string;
    allowed_subpath?: boolean;
  } | null;
  onSaved?: (path: {
    id?: string | number;
    _id?: string | number;
    name: string;
    path: string;
    allowed_subpath: boolean;
  }) => void;
}) {
  const [path, setPath] = React.useState("");
  const [pathName, setPathName] = React.useState("");
  const [allowedSubpath, setAllowedSubpath] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  const resetForm = React.useCallback(() => {
    setPath("");
    setPathName("");
    setAllowedSubpath(true);
    setErrorMessage("");
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    setPath(pathToEdit?.path ?? "");
    setPathName(pathToEdit?.name ?? "");
    setAllowedSubpath(pathToEdit?.allowed_subpath !== false);
    setErrorMessage("");
  }, [open, pathToEdit, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const token = getStoredToken();
  const userId = decodeTokenPayload(token)?.id ?? null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedPath = path.trim();
    const trimmedName = pathName.trim();

    if (!token || (!pathToEdit && userId == null)) {
      setErrorMessage(
        `You must be signed in to ${pathToEdit ? "edit" : "add"} a path.`,
      );
      return;
    }

    try {
      const pathId = pathToEdit?.id ?? pathToEdit?._id;
      if (pathToEdit && pathId == null) {
        throw new Error("This path cannot be edited because it has no ID.");
      }

      const response = await fetch(
        pathToEdit
          ? `${API_BASE}/api/paths/${encodeURIComponent(String(pathId))}`
          : `${API_BASE}/api/paths`,
        {
          method: pathToEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            pathToEdit
              ? {
                  path: trimmedPath,
                  name: trimmedName,
                  allowed_subpath: allowedSubpath,
                }
              : {
                  path: trimmedPath,
                  name: trimmedName,
                  user_id: userId,
                  allowed_subpath: allowedSubpath,
                },
          ),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        let message = errorText;

        try {
          const errorBody: unknown = JSON.parse(errorText);
          if (typeof errorBody === "object" && errorBody !== null) {
            if ("error" in errorBody && typeof errorBody.error === "string") {
              message = errorBody.error;
            } else if (
              "message" in errorBody &&
              typeof errorBody.message === "string"
            ) {
              message = errorBody.message;
            }
          }
        } catch {
          // The response may contain a plain-text error.
        }

        throw new Error(
          message ||
            `Failed to ${pathToEdit ? "update" : "create"} path (${response.status}).`,
        );
      }

      handleClose();
      onSaved?.({
        id: pathToEdit?.id,
        _id: pathToEdit?._id,
        name: trimmedName,
        path: trimmedPath,
        allowed_subpath: allowedSubpath,
      });
    } catch (error) {
      console.error(`Failed to ${pathToEdit ? "edit" : "add"} path`, error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Failed to ${pathToEdit ? "update" : "create"} path.`,
      );
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      title={pathToEdit ? "Edit Path" : "Add Path"}
      content={
        pathToEdit
          ? "Update this path's details."
          : "Enter details for the new path."
      }
      errorMessage={errorMessage}
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
        <FormControlLabel
          control={
            <Switch
              checked={allowedSubpath}
              onChange={(event) => setAllowedSubpath(event.target.checked)}
            />
          }
          label="Allow access to child folders"
        />
    </CustomDialog>
  );
}
