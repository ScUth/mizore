import * as React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { AccountCircle, Brush } from "@mui/icons-material";

// const width = 250;
const navItems = [
  {
    text: "Account",
    icon: <AccountCircle />,
  },
  {
    text: "Appearance",
    icon: <Brush />,
  },
];

export default function SettingBar({ width }: { width: number }) {
  return (
    <Box
      component="nav"
      sx={{
        width: width,
        flexShrink: 0,
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: width,
            boxSizing: "border-box",
            position: "relative", // <-- key fix: no longer fixed to viewport
            // border: "none",
          },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.text}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
