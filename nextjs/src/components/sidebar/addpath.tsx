"use client";

import * as React from "react";
import {
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import CustomDialog from "./dialog";

type PathRecord = {
  id?: string | number;
  _id?: string | number;
  name: string;
  path: string;
  allowed_subpath: boolean;
};

function trimSlashes(value: string) {
  return value.replace(/^[/\\]+|[/\\]+$/g, "");
}

function joinSourcePath(source: string, relativePath: string) {
  const rest = trimSlashes(relativePath.trim());
  if (!source) return relativePath.trim();
  const base = source.replace(/\/+$/, "") || "/";
  if (!rest) return base;
  return base === "/" ? `/${rest}` : `${base}/${rest}`;
}

// Split a saved path into the source (mounted root) it lives under and the
// rest of the path. Old rows saved relative to the first root fall back to it.
function splitSourcePath(fullPath: string, sources: string[]) {
  const normalized = `/${trimSlashes(fullPath.trim())}`;
  const match = [...sources]
    .sort((a, b) => b.length - a.length)
    .find(
      (source) =>
        source === "/" ||
        normalized === source ||
        normalized.startsWith(`${source}/`),
    );
  if (match) {
    return {
      source: match,
      relativePath: trimSlashes(normalized.slice(match.length)),
    };
  }
  return { source: sources[0] ?? "", relativePath: trimSlashes(fullPath) };
}

export default function AddPathDialog({
  open,
  onClose,
  pathToEdit = null,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  pathToEdit?: Partial<PathRecord> | null;
  onSaved?: (path: PathRecord) => void;
}) {
  const { user, accessToken, request, upsertPath } = useAppContext();
  const [path, setPath] = React.useState("");
  const [pathName, setPathName] = React.useState("");
  const [allowedSubpath, setAllowedSubpath] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [sources, setSources] = React.useState<string[]>([]);
  const [source, setSource] = React.useState("");
  const [sourcesLoaded, setSourcesLoaded] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setPath("");
    setPathName("");
    setAllowedSubpath(true);
    setErrorMessage("");
  }, []);

  React.useEffect(() => {
    if (!open || !accessToken) return;

    let cancelled = false;
    setSourcesLoaded(false);
    const loadSources = async () => {
      try {
        const response = await request("/api/sources");
        if (!response.ok) {
          throw new Error(`Failed to load sources (${response.status})`);
        }
        const data = await response.json();
        if (!cancelled) {
          setSources(
            Array.isArray(data?.sources)
              ? data.sources.filter((item: unknown) => typeof item === "string")
              : [],
          );
        }
      } catch (error) {
        console.error("Failed to load mounted sources", error);
        if (!cancelled) setSources([]);
      } finally {
        if (!cancelled) setSourcesLoaded(true);
      }
    };

    void loadSources();
    return () => {
      cancelled = true;
    };
  }, [open, accessToken, request]);

  // Once sources are known, pick the source for the path being edited
  // (or the first source for a new path) and show only the part inside it.
  React.useEffect(() => {
    if (!open || !sourcesLoaded) return;
    if (sources.length === 0) {
      setSource("");
      setPath(pathToEdit?.path ?? "");
      return;
    }
    const split = splitSourcePath(pathToEdit?.path ?? "", sources);
    setSource(split.source);
    setPath(split.relativePath);
  }, [open, sourcesLoaded, sources, pathToEdit]);

  React.useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    setPathName(pathToEdit?.name ?? "");
    setAllowedSubpath(pathToEdit?.allowed_subpath !== false);
    setErrorMessage("");
  }, [open, pathToEdit, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedPath = joinSourcePath(source, path);
    const trimmedName = pathName.trim();
    const userId = user?.id;

    if (!accessToken || (!pathToEdit && userId == null)) {
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

      const response = await request(
        pathToEdit
          ? `/api/paths/${encodeURIComponent(String(pathId))}`
          : "/api/paths",
        {
          method: pathToEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: trimmedPath,
            name: trimmedName,
            ...(pathToEdit ? {} : { user_id: userId }),
            allowed_subpath: allowedSubpath,
          }),
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

      const data = await response.json();
      const savedPath: PathRecord = {
        ...pathToEdit,
        ...(data?.path ?? {}),
        name: trimmedName,
        path: trimmedPath,
        allowed_subpath: allowedSubpath,
      };
      upsertPath(savedPath);
      handleClose();
      onSaved?.(savedPath);
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
      {sources.length > 0 && (
        <TextField
          select
          fullWidth
          label="Source"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          margin="normal"
          required
          helperText="Mounted folder this path lives under"
        >
          {sources.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        autoFocus
        fullWidth
        label={sources.length > 0 ? "Folder inside source" : "Path"}
        placeholder={sources.length > 0 ? "e.g. Documents/Work" : "e.g. /home/user/Documents"}
        value={path}
        onChange={(event) => setPath(event.target.value)}
        margin="normal"
        required={sources.length === 0}
        helperText={
          sources.length > 0
            ? `Saved as ${joinSourcePath(source, path)}`
            : undefined
        }
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
