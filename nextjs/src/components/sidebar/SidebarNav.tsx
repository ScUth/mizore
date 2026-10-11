import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const navItems = [{ text: "Home", icon: <HomeIcon />, href: "/" }];

export default function SidebarNav() {
  return (
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
  );
}