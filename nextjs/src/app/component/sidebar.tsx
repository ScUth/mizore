"use client";

import * as React from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";

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
  const [me, setMe] = React.useState("");

  React.useEffect(() => {
    const loadMe = async () => {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        setMe("Guest");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setMe("Guest");
          return;
        }

        const data = await response.json();
        setMe(data?.user?.username || data?.username || "Guest");
      } catch (error) {
        console.error("Failed to load /api/me", error);
        setMe("Guest");
      }
    };

    void loadMe();
  }, []);

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
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ ml: "auto" }}
          >
            {me || "Account"}
          </Typography>
          {/* Account name from /api/me */}
          <IconButton sx={{ ml: 1 }} href="/admin/setting"> 
            <SettingsIcon sx={{ color: "#fff" }} />
          </IconButton>
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
