import * as React from "react";
import { Box, Collapse, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ExpandLess, ExpandMore, FolderOutlined, StorageOutlined } from "@mui/icons-material";
import { groupPathsByRoot, matchesSelectedPath } from "./utils";

export default function PathList({
  paths, roots, loading, error, index, onSelect, onOpenMenu,
}: {
  paths: any[];
  roots: string[];
  loading?: boolean;
  error?: string | null;
  index: string;
  onSelect: (path: any, i: number) => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, path: any) => void;
}) {
  const groups = React.useMemo(() => groupPathsByRoot(paths, roots), [paths, roots]);

  // Mount folders start expanded; the user can collapse them.
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const toggle = (root: string) => setCollapsed((c) => ({ ...c, [root]: !c[root] }));

  return (
    <Box sx={{ minHeight: 0, overflowY: "auto" }}>
      {loading && <Typography sx={{ px: 2, py: 1 }} color="text.secondary">Loading paths...</Typography>}
      {error && <Typography sx={{ px: 2, py: 1 }} color="error" variant="body2">{error}</Typography>}

      <List sx={{ pt: 0 }}>
        {groups.map(({ root, items }) => {
          const open = !collapsed[root];
          return (
            <React.Fragment key={root}>
              <ListItemButton onClick={() => toggle(root)} aria-expanded={open}>
                <ListItemIcon><StorageOutlined /></ListItemIcon>
                <ListItemText
                  primary={root}
                  secondary={`${items.length} path${items.length === 1 ? "" : "s"}`}
                  slotProps={{
                    primary: { noWrap: true, title: root, sx: { fontSize: "0.875rem", fontWeight: 500 } },
                    secondary: { sx: { fontSize: "0.75rem" } },
                  }}
                />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={open} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {items.length === 0 && (
                    <Typography sx={{ pl: 9, py: 0.5 }} variant="body2" color="text.secondary">
                      No paths
                    </Typography>
                  )}
                  {items.map(({ path: p, index: i }) => {
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
                            pl: 4,
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
                            slotProps={{ primary: { noWrap: true, title: p.path, sx: { fontSize: "0.875rem" } } }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}
