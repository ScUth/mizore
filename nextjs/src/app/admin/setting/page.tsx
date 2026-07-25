"use client";
import { Box, CssBaseline } from "@mui/material";
import * as React from "react";
import Sidebar from "../../component/sidebar";

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
      <Sidebar onAddPathClickOpen={handleAddPathClickOpen} index="Setting"/>
    </Box>
  );
}
