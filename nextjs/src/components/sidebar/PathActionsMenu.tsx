import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

export default function PathActionsMenu({
  anchorEl, onClose, onEdit, onDelete,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem onClick={() => { onEdit(); onClose(); }}>
        <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Edit path</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { onDelete(); onClose(); }}>
        <ListItemIcon><DeleteOutlinedIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Delete path</ListItemText>
      </MenuItem>
    </Menu>
  );
}