"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CssBaseline,
  Button,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import AddPathDialog from "../../../components/sidebar/addpath";
import Sidebar, { APPBAR_HEIGHT } from "../../../components/sidebar";

const drawerWidth = 240;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

function getItemName(item: unknown) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const entry = item as { name?: unknown; path?: unknown };
    if (typeof entry.name === "string") return entry.name;
    if (typeof entry.path === "string") return entry.path;
  }
  return JSON.stringify(item);
}

function isFolder(item: unknown, name: string) {
  if (item && typeof item === "object") {
    const entry = item as {
      type?: unknown;
      kind?: unknown;
      isDirectory?: unknown;
    };
    if (
      entry.isDirectory === true ||
      entry.type === "directory" ||
      entry.kind === "directory"
    )
      return true;
    if (
      entry.isDirectory === false ||
      entry.type === "file" ||
      entry.kind === "file"
    )
      return false;
  }
  return !name.includes(".");
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function getParentPath(path: string) {
  const normalizedPath = normalizePath(path);
  const separatorIndex = normalizedPath.lastIndexOf("/");
  return separatorIndex < 0 ? "" : normalizedPath.slice(0, separatorIndex);
}

export default function PathContent({
  selectedPath = "",
}: {
  selectedPath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { request, accessToken, currentPath, setCurrentPath } = useAppContext();
  const folderPath = searchParams.get("folder");
  const [openAddPathDialog, setOpenAddPathDialog] = React.useState(false);
  const [listItems, setListItems] = React.useState<unknown[]>([]);
  const [loadingList, setLoadingList] = React.useState(false);
  const [listError, setListError] = React.useState("");
  const [allowedSubpath, setAllowedSubpath] = React.useState(true);

  React.useEffect(() => {
    setCurrentPath(folderPath ?? selectedPath);
  }, [folderPath, selectedPath, setCurrentPath]);

  React.useEffect(() => {
    if (!currentPath) {
      setListItems([]);
      setListError("");
      setLoadingList(false);
      return;
    }

    let cancelled = false;
    const loadPathContents = async () => {
      setListItems([]);
      setListError("");
      setLoadingList(true);
      const trimmedPath = normalizePath(currentPath);

      try {
        const token = accessToken;
        const response = await request(
          `${API_BASE}/api/list/${encodeURIComponent(trimmedPath)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to load list content");
        }

        const data = await response.json();
        if (!cancelled) {
          setListItems(data?.files || (Array.isArray(data) ? data : []));
        }
      } catch (error) {
        if (!cancelled) {
          setListError(
            error instanceof Error
              ? error.message
              : "Failed to load list content",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingList(false);
        }
      }
    };

    void loadPathContents();

    return () => {
      cancelled = true;
    };
  }, [accessToken, currentPath, request]);

  const navigateToFolder = (targetPath: string) => {
    const normalizedTarget = normalizePath(targetPath);
    const query = new URLSearchParams(searchParams.toString());
    if (normalizedTarget === normalizePath(selectedPath)) {
      query.delete("folder");
    } else {
      query.set("folder", normalizedTarget);
    }
    const queryString = query.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const enterFolder = (name: string) => {
    if (
      !allowedSubpath ||
      !name ||
      name === "." ||
      name === ".." ||
      /[\\/]/.test(name)
    ) {
      return;
    }
    navigateToFolder(`${normalizePath(currentPath)}/${name}`);
  };

  const goUp = () => {
    if (normalizePath(currentPath) === normalizePath(selectedPath)) {
      return;
    }
    navigateToFolder(getParentPath(currentPath));
  };

  return (
    <>
      <CssBaseline />
      <Sidebar
        onAddPathClickOpen={() => setOpenAddPathDialog(true)}
        onPathAccessChange={setAllowedSubpath}
        index={selectedPath || "Landing Page"}
      />
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          p: 3,
          pt: {
            xs: `${APPBAR_HEIGHT.xs + 24}px`,
            sm: `${APPBAR_HEIGHT.sm + 24}px`,
          },
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {normalizePath(currentPath) !== normalizePath(selectedPath) && (
            <Button
              onClick={goUp}
              startIcon={<ArrowUpwardIcon />}
              aria-label="Go to parent folder"
            >
              Up
            </Button>
          )}
          <Typography variant="h5" component="h1" sx={{ mb: 0 }}>
            {selectedPath
              ? `Contents for ${currentPath}`
              : "Select a path to view its contents"}
          </Typography>
        </Box>

        {loadingList ? (
          <Typography>Loading contents...</Typography>
        ) : listError ? (
          <Typography color="error">{listError}</Typography>
        ) : listItems.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 2,
            }}
          >
            {listItems.map((item, index) => {
              const name = getItemName(item);
              const folder = isFolder(item, name);
              const Icon = folder
                ? FolderOutlinedIcon
                : DescriptionOutlinedIcon;

              return (
                <Card
                  key={`${name}-${index}`}
                  variant="outlined"
                  sx={{ minWidth: 0 }}
                >
                  <CardActionArea
                    sx={{ height: "100%" }}
                    disabled={!folder || !allowedSubpath}
                    onClick={() => enterFolder(name)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Icon
                        color={folder ? "warning" : "action"}
                        sx={{ fontSize: 42 }}
                      />
                      <Typography
                        variant="body2"
                        title={name}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Typography>
            {selectedPath ? "No contents found." : "No contents loaded yet."}
          </Typography>
        )}

        <AddPathDialog
          open={openAddPathDialog}
          onClose={() => setOpenAddPathDialog(false)}
        />
      </Box>
    </>
  );
}
