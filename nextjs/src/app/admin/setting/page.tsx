"use client";
import { Box, CssBaseline } from "@mui/material";
import * as React from "react";
import Sidebar from "../../component/sidebar";
import SettingBar from "../components/settingBar";
import Account from "./components/account";

const drawerWidth = 240;
const settingDrawerWidth = 240;
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
          pl: 10,
          pt: {
            xs: `${APPBAR_HEIGHT.xs + 50}px`,
            sm: `${APPBAR_HEIGHT.sm + 50}px`,
          },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <h1>Setting</h1>

        {/* Row wrapper: SettingBar + content side by side */}
        <Box sx={{ display: "flex" }}>
          <SettingBar width={settingDrawerWidth} />

          <Box
            sx={{
              flexGrow: 1,
              pl: 5,
              pt: {
                xs: `${APPBAR_HEIGHT.xs}px`,
                sm: `${APPBAR_HEIGHT.sm}px`,
              },
              width: {
                sm: `calc(100% - ${settingDrawerWidth}px - ${drawerWidth}px)`,
              },
            }}
          >
            {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore dolores unde rerum doloremque nesciunt, numquam veniam ex consectetur expedita animi consequatur ut fugiat nulla iusto corporis sunt rem eveniet omnis? */}
            <Account width={`calc(100% - ${settingDrawerWidth}px)`}/>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}