"use client"
import * as React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import CustomDialog from './component/dialog';

const drawerWidth = 240;

// Single source of truth for AppBar height per breakpoint.
const APPBAR_HEIGHT = { xs: 56, sm: 30 };

const navItems = [
  { text: 'Home', icon: <HomeIcon />, href: "/" },
  { text: 'Inbox', icon: <InboxIcon /> },
];

export default function AppBarDrawer() {
  const [openAddPathDialog, setOpenAddPathDialog] = React.useState(false);

  const handleAddPathClickOpen = () => {
    console.log('clicked');
    setOpenAddPathDialog(true);
  };

  const handleAddPathClose = () => {
    setOpenAddPathDialog(false);
  };

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
          <IconButton sx={{ ml: 1 }} href="/setting">
            <SettingsIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: drawerWidth,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
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
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Typography sx={{ m: 2 }}>
            Registered Path
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleAddPathClickOpen}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Add Path" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </Box>

      {/* Main content */}
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

        <CustomDialog
          open={openAddPathDialog}
          onClose={handleAddPathClose}
          title="Add Path"
          content="Enter details for the new path."
        />
      </Box>
    </Box>
  );
}