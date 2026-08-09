"use client";

import * as React from "react";
import {
  AppBar,
  Box,
  Drawer,
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
import { useRouter } from "next/navigation";

const drawerWidth = 240;
export const APPBAR_HEIGHT = { xs: 56, sm: 30 };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

const navItems = [{ text: "Home", icon: <HomeIcon />, href: "/" }];

export default function Sidebar({
  onAddPathClickOpen,
  index,
}: {
  onAddPathClickOpen: () => void;
  index: string;
}) {
  const router = useRouter();
  const [account, setAccount] = React.useState<{ name: string; role: string; id?: string }>({ name: "Account", role: "user" });
  const [paths, setPaths] = React.useState<any[]>([]);
  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState<null | HTMLElement>(null);

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
    window.localStorage.removeItem("accessToken");
    router.push("/login");
  };

  React.useEffect(() => {
    const loadMe = async () => {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        setAccount({ name: "Guest", role: "user" });
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setAccount({ name: "Guest", role: "user" });
          return;
        }

        const data = await response.json();
        const userId = data?.user?.id || data?.id || undefined;

        setAccount({
          name: data?.user?.username || data?.username || "Guest",
          role: data?.user?.role || data?.role || "user",
          id: userId,
        });

        // Fetch user's paths if we have an id
        if (userId) {
          try {
            const pResp = await fetch(`${API_BASE}/api/paths/${userId}`, {
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
        setAccount({ name: "Guest", role: "user" });
      }
    };

    void loadMe();
  }, []);

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
              top: APPBAR_HEIGHT.sm + 10,
              height: `calc(100% - ${APPBAR_HEIGHT.sm + 10}px)`,
            },
          }}
          open
        >
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton href={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Typography sx={{ m: 2 }}>Registered Path</Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={onAddPathClickOpen}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Add Path" />
              </ListItemButton>
            </ListItem>
            {paths.map((p, i) => (
              <ListItem key={p.id || p._id || i} disablePadding>
                <ListItemButton
                  onClick={() =>
                    router.push(`/admin/paths/${p.id || p._id || encodeURIComponent(p.name || p.path || String(i))}`)
                  }
                >
                  <ListItemText primary={p.name || p.path || p.label || p._id || p.id || `Path ${i + 1}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
    </>
  );
}
