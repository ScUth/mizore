"use client";
import * as React from "react";
import { Box, Button, CssBaseline, TextField, Typography } from "@mui/material";
import AdminGuard from "./components/adminGuard";
import CustomDialog from "../component/dialog";
import Sidebar, { APPBAR_HEIGHT } from "../component/sidebar";

const drawerWidth = 240;

export default function LandingPage() {
  const [openAddPathDialog, setOpenAddPathDialog] = React.useState(false);
  const [Path, setPath] = React.useState("");
  const [currentPath, setCurrentPath] = React.useState("");

  const handleAddPathClickOpen = () => {
    setOpenAddPathDialog(true);
  };

  const handleAddPathClose = () => {
    setPath("");
    setOpenAddPathDialog(false);
  };

  const handleSubmitAddPath = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedPath = Path.trim();
    if (!trimmedPath) return;

    try {
      // await addPath(trimmedPath); // your API/service call
      console.log(trimmedPath);
      setPath("");
      handleAddPathClose();
    } catch (error) {
      console.error("Failed to add path", error);
    }
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

        <CustomDialog
          open={openAddPathDialog}
          onClose={handleAddPathClose}
          title="Add Path"
          content="Enter details for the new path."
          onSubmit={handleSubmitAddPath}
          actions={
            <>
              <Button onClick={handleAddPathClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </>
          }
        >
          <TextField
            autoFocus
            fullWidth
            label="Path"
            placeholder="e.g. /api/users or C:\Projects\MyPath"
            value={Path}
            onChange={(event) => setPath(event.target.value)}
            margin="normal"
            required
          />
        </CustomDialog>
      </Box>
    </Box>
    </AdminGuard>
  );
}
