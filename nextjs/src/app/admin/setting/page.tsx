"use client";
import { Box, CssBaseline } from "@mui/material";
import * as React from "react";
import Sidebar from "../../component/sidebar";
import SettingBar from "../component/settingBar";

const drawerWidth = 240;
export const APPBAR_HEIGHT = { xs: 56, sm: 30 };

export default function Setting() {
  const [openAddPathDialog, setOpenAddPathDialog] = React.useState(false);
  const [Path, setPath] = React.useState("");

  const handleAddPathClickOpen = () => {
    setOpenAddPathDialog(true);
  };

  const handleAddPathClose = () => {
    setPath("");
    setOpenAddPathDialog(false);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar onAddPathClickOpen={handleAddPathClickOpen} index="Setting" />

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
        <SettingBar />
      </Box>
    </Box>
  );
}
