"use client";
import * as React from "react";
import { Box, CssBaseline, Typography } from "@mui/material";
import AdminGuard from "./components/adminGuard";
import AddPathDialog from "./components/addpath";
import Sidebar, { APPBAR_HEIGHT } from "../component/sidebar";

const drawerWidth = 240;

export default function LandingPage() {
  const [openAddPathDialog, setOpenAddPathDialog] = React.useState(false);
  const [currentPath] = React.useState("");

  const handleAddPathClickOpen = () => {
    setOpenAddPathDialog(true);
  };

  const handleAddPathClose = () => {
    setOpenAddPathDialog(false);
  };

  return (
    <AdminGuard>
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar onAddPathClickOpen={handleAddPathClickOpen} index={currentPath || "Landing Page"}/>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: {
            xs: `${APPBAR_HEIGHT.xs + 24}px`,
            sm: `${APPBAR_HEIGHT.sm + 24}px`,
          },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Typography component="p">
          This is your main content area. It no longer needs an empty Toolbar
          spacer — the offset is handled by the parent layout.
        </Typography>

        <AddPathDialog open={openAddPathDialog} onClose={handleAddPathClose} />
      </Box>
    </Box>
    </AdminGuard>
  );
}
