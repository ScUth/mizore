"use client";

import * as React from "react";
import { AppBar, Box, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { APPBAR_HEIGHT } from "./constants";

export default function SidebarAppBar({ index }: { index: string }) {
  const router = useRouter();
  const { user, accessToken, clearSession } = useAppContext();
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  const name = user?.username ?? (accessToken ? "Account" : "Guest");
  const role = user?.role ?? "user";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const close = () => setAnchor(null);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: APPBAR_HEIGHT, px: 1 }}>
        <Typography>{index}</Typography>
        <Box
          component="button"
          type="button"
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
          sx={{
            ml: "auto", display: "flex", alignItems: "center", gap: 1,
            px: 1, py: 0.5, border: 0, borderRadius: 1,
            background: "transparent", color: "inherit", cursor: "pointer", textAlign: "left",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
          }}
        >
          <Typography variant="subtitle1" noWrap component="div">{name}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>{roleLabel}</Typography>
        </Box>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={close}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => { close(); router.push("/admin/setting"); }}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { close(); clearSession(); router.replace("/login"); }}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}