"use client"
import * as React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

// Single source of truth for AppBar height per breakpoint.
// Everything else derives its offset from this instead of
// carrying its own spacer element.
const APPBAR_HEIGHT = { xs: 56, sm: 30 };

const navItems = [
  { text: 'Home', icon: <HomeIcon /> },
  { text: 'Inbox', icon: <InboxIcon /> },
  { text: 'Mail', icon: <MailIcon /> },
];

export default function AppBarDrawer() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT, px: 1 }}>
          <Typography>
            Path
          </Typography>
          <Typography variant="subtitle1" noWrap component="div" sx={{ ml: 'auto' }}>
            Account
          </Typography>
          <IconButton sx={{ ml: 1 }}>
            <SettingsIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer: content itself is unaware of the AppBar.
          The offset lives entirely on the Drawer's paper. */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: drawerWidth,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              // start the panel below the AppBar...
              top: APPBAR_HEIGHT.sm + 10,
              // ...and shrink its height so it doesn't run under it
              height: `calc(100% - ${APPBAR_HEIGHT.sm}px)`,
            },
          }}
          open
        >
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Drawer>
      </Box>

      {/* Main content: also unaware of the AppBar; offset applied
          once via padding-top rather than an internal spacer. */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: `${APPBAR_HEIGHT.xs + 24}px`, sm: `${APPBAR_HEIGHT.sm + 24}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Typography component="p">
          This is your main content area. It no longer needs an empty
          Toolbar spacer — the offset is handled by the parent layout.
        </Typography>
      </Box>
    </Box>
  );
}