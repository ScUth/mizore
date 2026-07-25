import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function CustomDialog({
  open,
  onClose,
  title,
  content,
  children,
  actions,
  onSubmit,
}: CustomDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={
        onSubmit
          ? { paper: { component: 'form', onSubmit } }
          : undefined
      }
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        {children}
      </DialogContent>
      <DialogActions>
        {actions ?? (
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
