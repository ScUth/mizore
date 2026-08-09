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
  const [account, setAccount] = React.useState({ name: "Account", role: "user" });
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
        setAccount({
          name: data?.user?.username || data?.username || "Guest",
          role: data?.user?.role || data?.role || "user",
        });
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
          </List>
        </Drawer>
      </Box>
    </>
  );
}
