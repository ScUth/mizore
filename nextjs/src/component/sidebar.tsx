"use client";

import * as React from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FolderOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import AddPathDialog from "./addpath";
import CustomDialog from "./dialog";

const drawerWidth = 240;
export const APPBAR_HEIGHT = { xs: 56, sm: 30 };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";
const navItems = [{ text: "Home", icon: <HomeIcon />, href: "/" }];

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
  const {
    user,
    setUser,
    accessToken,
    paths,
    pathsLoading,
    pathsError,
    setPaths,
    upsertPath,
    removePath,
    request,
    clearSession,
  } = useAppContext();
  const token = accessToken;
  const account = {
    name: user?.username ?? (accessToken ? "Account" : "Guest"),
    role: user?.role ?? "user",
    id: user?.id,
  };
  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [pathMenuAnchor, setPathMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [actionPath, setActionPath] = React.useState<any | null>(null);
  const [editingPath, setEditingPath] = React.useState<any | null>(null);
  const [deletingPath, setDeletingPath] = React.useState<any | null>(null);
  const [deleteError, setDeleteError] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleSettingsClick = () => {
    handleAccountMenuClose();
    router.push("/admin/setting");
  };

  const handleLogoutClick = () => {
    handleAccountMenuClose();
    clearSession();
    router.replace("/login");
  };

  const handlePathMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    path: any,
  ) => {
    event.stopPropagation();
    setActionPath(path);
    setPathMenuAnchor(event.currentTarget);
  };

  const handlePathMenuClose = () => {
    setPathMenuAnchor(null);
  };

  const matchesSelectedPath = (candidate: any) => {
    const candidateValues = [candidate?.path, candidate?.name, candidate?.label];

    return candidateValues.some(
      (value) => String(index) === String(value ?? ""),
    );
  };

  const handleDeletePath = async () => {
    const pathId = deletingPath?.id ?? deletingPath?._id;
    if (pathId == null) {
      setDeleteError("This path cannot be deleted because it has no ID.");
      return;
    }
    if (!accessToken) {
      setDeleteError("You must be signed in to delete a path.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await request(
        `${API_BASE}/api/paths/${encodeURIComponent(String(pathId))}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete path (${response.status}).`);
      }

      removePath(pathId);
      if (matchesSelectedPath(deletingPath)) {
        router.push("/admin");
      }
      setDeletingPath(null);
    } catch (error) {
      console.error("Failed to delete path", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete path.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  React.useEffect(() => {
    const loadMe = async () => {
      if (!accessToken) {
        setUser(null);
        return;
      }

      try {
        const response = await request(`${API_BASE}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        const userId = data?.user?.id || data?.id || undefined;

        setUser(data?.user ?? {
          id: userId,
          username: data?.username ?? "Guest",
          role: data?.role ?? "user",
        });

        // Fetch user's paths if we have an id
        if (userId) {
          try {
            const pResp = await request(`${API_BASE}/api/paths/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (pResp.ok) {
              const pData = await pResp.json();
              // accept either { paths: [...] } or an array result
              setPaths(pData?.paths || (Array.isArray(pData) ? pData : []));
            } else {
              setPaths([]);
            }
          } catch (err) {
            console.error('Failed to load /api/paths/:id', err);
            setPaths([]);
          }
        }
      } catch (error) {
        console.error("Failed to load /api/me", error);
        setUser(null);
      }
    };

    void loadMe();
  }, [accessToken, request, setPaths, setUser]);

  React.useEffect(() => {
    const selectedPath = paths.find(
      (path) =>
        String(index) === String(path.path ?? "") ||
        String(index) === String(path.name ?? ""),
    );
    if (selectedPath) {
      onPathAccessChange?.(selectedPath.allowed_subpath !== false);
    }
  }, [index, onPathAccessChange, paths]);

  const roleLabel = account.role
    ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
    : "User";

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT, px: 1 }}>
          <Typography>{index}</Typography>
          <Box
            component="button"
            type="button"
            onClick={handleAccountMenuOpen}
            sx={{
              ml: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.5,
              border: 0,
              borderRadius: 1,
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            <Typography variant="subtitle1" noWrap component="div">
              {account.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
              {roleLabel}
            </Typography>
          </Box>

          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              display: "flex",
              flexDirection: "column",
              top: APPBAR_HEIGHT.sm + 10,
              height: `calc(100% - ${APPBAR_HEIGHT.sm + 10}px)`,
              overflow: "hidden",
            },
          }}
          open
        >
          <List sx={{ flexShrink: 0 }}>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton href={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Typography sx={{ m: 2, mb: 1, flexShrink: 0 }}>
            Registered Path
          </Typography>
          <List sx={{ flexShrink: 0, pt: 0 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={onAddPathClickOpen}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Add Path" />
              </ListItemButton>
            </ListItem>
          </List>

          <Box sx={{ minHeight: 0, overflowY: "auto" }}>
            {pathsLoading ? (
              <Typography sx={{ px: 2, py: 1 }} color="text.secondary">
                Loading paths...
              </Typography>
            ) : null}
            {pathsError ? (
              <Typography sx={{ px: 2, py: 1 }} color="error" variant="body2">
                {pathsError}
              </Typography>
            ) : null}
            <List sx={{ pt: 0 }}>
            {paths.map((p, i) => (
              <ListItem
                key={p.id || p._id || i}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={`Actions for ${p.name || p.path || `Path ${i + 1}`}`}
                    onClick={(event) => handlePathMenuOpen(event, p)}
                    size="small"
                    sx={{ mr: 0.5 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  sx={{
                    pr: 6,
                    "&.Mui-selected": {
                      backgroundColor: "action.selected",
                      borderLeft: 3,
                      borderColor: "primary.main",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "action.selected",
                    },
                  }}
                  selected={
                    String(index) === String(p.path ?? p.name ?? p.label ?? "")
                  }
                  onClick={() => {
                    const rawPath = p.path ?? p.name ?? p.label ?? p._id ?? p.id ?? String(i);
                    const pathName = p.name ?? p.label ?? rawPath;
                    onPathAccessChange?.(p.allowed_subpath !== false);
                    router.push(`/admin/${encodeURIComponent(String(pathName))}?path=${encodeURIComponent(String(rawPath))}`);
                  }}
                >
                  <ListItemIcon><FolderOutlined/></ListItemIcon>
                  <ListItemText
                    primary={p.name || p.path || p.label || p._id || p.id || `Path ${i + 1}`}
                    slotProps={{
                      primary: {
                        noWrap: true,
                        sx: { fontSize: "0.875rem" },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            </List>
          </Box>
        </Drawer>
      </Box>

      <Menu
        anchorEl={pathMenuAnchor}
        open={Boolean(pathMenuAnchor)}
        onClose={handlePathMenuClose}
      >
        <MenuItem
          onClick={() => {
            setEditingPath(actionPath);
            handlePathMenuClose();
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit path</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteError("");
            setDeletingPath(actionPath);
            handlePathMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete path</ListItemText>
        </MenuItem>
      </Menu>

      <AddPathDialog
        open={Boolean(editingPath)}
        onClose={() => setEditingPath(null)}
        pathToEdit={editingPath}
        onSaved={(updatedPath) => {
          upsertPath(updatedPath);
          if (matchesSelectedPath(editingPath)) {
            onPathAccessChange?.(updatedPath.allowed_subpath);
            router.push(
              `/admin/${encodeURIComponent(updatedPath.name)}?path=${encodeURIComponent(updatedPath.path)}`,
            );
          }
          setEditingPath(null);
        }}
      />

      <CustomDialog
        open={Boolean(deletingPath)}
        onClose={() => {
          if (!isDeleting) setDeletingPath(null);
        }}
        title="Delete Path"
        content={`Are you sure you want to delete "${deletingPath?.name ?? deletingPath?.path ?? "this path"}"?`}
        errorMessage={deleteError}
        actions={
          <>
            <Button
              onClick={() => setDeletingPath(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => void handleDeletePath()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <></>
      </CustomDialog>
    </>
  );
}
