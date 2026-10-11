import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FolderOutlined } from "@mui/icons-material";
import { matchesSelectedPath } from "./utils";

export default function PathList({
  paths, loading, error, index, onSelect, onOpenMenu,
}: {
  paths: any[];
  loading?: boolean;
  error?: string | null;
  index: string;
  onSelect: (path: any, i: number) => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, path: any) => void;
}) {
  return (
    <Box sx={{ minHeight: 0, overflowY: "auto" }}>
      {loading && <Typography sx={{ px: 2, py: 1 }} color="text.secondary">Loading paths...</Typography>}
      {error && <Typography sx={{ px: 2, py: 1 }} color="error" variant="body2">{error}</Typography>}

      <List sx={{ pt: 0 }}>
        {paths.map((p, i) => {
          const label = p.name || p.path || p.label || p._id || p.id || `Path ${i + 1}`;
          return (
            <ListItem
              key={p.id || p._id || i}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  sx={{ mr: 0.5 }}
                  aria-label={`Actions for ${label}`}
                  onClick={(e) => onOpenMenu(e, p)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                sx={{
                  pr: 6,
                  "&.Mui-selected": { backgroundColor: "action.selected", borderLeft: 3, borderColor: "primary.main" },
                  "&.Mui-selected:hover": { backgroundColor: "action.selected" },
                }}
                selected={matchesSelectedPath(index, p)}
                onClick={() => onSelect(p, i)}
              >
                <ListItemIcon><FolderOutlined /></ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { noWrap: true, sx: { fontSize: "0.875rem" } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}2