"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CssBaseline,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AddPathDialog from "../../../component/addpath";
import Sidebar, { APPBAR_HEIGHT } from "../../../component/sidebar";

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

export default function PathContent({
  selectedPath = "",
}: {
  selectedPath?: string;
}) {
  const [openAddPathDialog, setOpenAddPathDialog] = React.useState(false);
  const [listItems, setListItems] = React.useState<unknown[]>([]);
  const [loadingList, setLoadingList] = React.useState(false);
  const [listError, setListError] = React.useState("");

  React.useEffect(() => {
    if (!selectedPath) {
      setListItems([]);
      setListError("");
      return;
    }

    const loadPathContents = async () => {
      setListItems([]);
      setListError("");
      setLoadingList(true);
      const trimmedPath = selectedPath.replace(/^[\\/]+/, "");

      try {
        const token = window.localStorage.getItem("accessToken");
        const response = await fetch(
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
        setListItems(data?.files || (Array.isArray(data) ? data : []));
      } catch (error) {
        setListError(
          error instanceof Error
            ? error.message
            : "Failed to load list content",
        );
      } finally {
        setLoadingList(false);
      }
    };

    void loadPathContents();
  }, [selectedPath]);

  return (
    <>
      <CssBaseline />
      <Sidebar
        onAddPathClickOpen={() => setOpenAddPathDialog(true)}
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
        <Typography variant="h5" gutterBottom>
          {selectedPath
            ? `Contents for ${selectedPath}`
            : "Select a path to view its contents"}
        </Typography>

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
                  <CardActionArea sx={{ height: "100%" }}>
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
