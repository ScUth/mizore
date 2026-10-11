"use client";

import * as React from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import AddPathDialog from "./addpath";
import SidebarAppBar from "./SidebarAppBar";
import SidebarNav from "./SidebarNav";
import PathList from "./PathList";
import PathActionsMenu from "./PathActionsMenu";
import DeletePathDialog from "./DeletePathDialog";
import { useLoadUserAndPaths } from "./hooks/useLoadUserAndPaths";
import { APPBAR_HEIGHT, DRAWER_WIDTH } from "./constants";
import { matchesSelectedPath } from "./utils";

export default function Sidebar({
  onAddPathClickOpen,
  onPathAccessChange,
  index,
}: {
  onAddPathClickOpen: () => void;
  onPathAccessChange?: (allowed: boolean) => void;
  index: string;
}) {
  const router = useRouter();
  const { paths, pathsLoading, pathsError, upsertPath } = useAppContext();

  useLoadUserAndPaths();

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [actionPath, setActionPath] = React.useState<any | null>(null);
  const [editingPath, setEditingPath] = React.useState<any | null>(null);
  const [deletingPath, setDeletingPath] = React.useState<any | null>(null);

  React.useEffect(() => {
    const selected = paths.find((p) => matchesSelectedPath(index, p));
    if (selected) onPathAccessChange?.(selected.allowed_subpath !== false);
  }, [index, onPathAccessChange, paths]);

  const goToPath = (p: any, i: number) => {
    const rawPath = p.path ?? p.name ?? p.label ?? p._id ?? p.id ?? String(i);
    const pathName = p.name ?? p.label ?? rawPath;
    onPathAccessChange?.(p.allowed_subpath !== false);
    router.push(`/admin/${encodeURIComponent(String(pathName))}?path=${encodeURIComponent(String(rawPath))}`);
  };

  return (
    <>
      <SidebarAppBar index={index} />

      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            width: DRAWER_WIDTH,
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              display: "flex",
              flexDirection: "column",
              top: APPBAR_HEIGHT.sm + 10,
              height: `calc(100% - ${APPBAR_HEIGHT.sm + 10}px)`,
              overflow: "hidden",
            },
          }}
        >
          <SidebarNav />

          <Typography sx={{ m: 2, mb: 1, flexShrink: 0 }}>Registered Path</Typography>
          <List sx={{ flexShrink: 0, pt: 0 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={onAddPathClickOpen}>
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="Add Path" />
              </ListItemButton>
            </ListItem>
          </List>

          <PathList
            paths={paths}
            loading={pathsLoading}
            error={pathsError}
            index={index}
            onSelect={goToPath}
            onOpenMenu={(e, p) => {
              e.stopPropagation();
              setActionPath(p);
              setMenuAnchor(e.currentTarget);
            }}
          />
        </Drawer>
      </Box>

      <PathActionsMenu
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        onEdit={() => setEditingPath(actionPath)}
        onDelete={() => setDeletingPath(actionPath)}
      />

      <AddPathDialog
        open={Boolean(editingPath)}
        onClose={() => setEditingPath(null)}
        pathToEdit={editingPath}
        onSaved={(updated) => {
          upsertPath(updated);
          if (matchesSelectedPath(index, editingPath)) {
            onPathAccessChange?.(updated.allowed_subpath);
            router.push(`/admin/${encodeURIComponent(updated.name)}?path=${encodeURIComponent(updated.path)}`);
          }
          setEditingPath(null);
        }}
      />

      <DeletePathDialog
        path={deletingPath}
        onClose={() => setDeletingPath(null)}
        onDeleted={(p) => {
          if (matchesSelectedPath(index, p)) router.push("/admin");
        }}
      />
    </>
  );
}