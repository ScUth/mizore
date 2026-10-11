import * as React from "react";
import {
  Alert,
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
  errorMessage?: string;
}

export default function CustomDialog({
  open,
  onClose,
  title,
  content,
  children,
  actions,
  onSubmit,
  errorMessage,
}: CustomDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={
        onSubmit
          ? {
              paper: {
                component: "form",
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => onSubmit(event),
              } as React.ComponentProps<typeof Dialog>["slotProps"],
            }
          : undefined
      }
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        {children}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
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
