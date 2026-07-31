"use client";

import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";

type UserRow = {
  id: number;
  username: string;
  role: string;
  created_at?: string;
};

type AccountProps = {
  width?: number | string;
};

// Prefer an env var so this isn't hardcoded to one machine's LAN IP.
// Add NEXT_PUBLIC_API_URL=http://192.168.1.57:4000 to your .env.local as a fallback during dev.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

const ROLE_OPTIONS = ["admin", "user", "editor"];

export default function Account({ width = "100%" }: AccountProps) {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // Edit dialog state
  const [editingUser, setEditingUser] = React.useState<UserRow | null>(null);
  const [editUsername, setEditUsername] = React.useState("");
  const [editRole, setEditRole] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");
  const [toastOpen, setToastOpen] = React.useState(false);

  const loadUsers = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Be tolerant of different API response shapes:
      // { users: [...] }  OR  a bare array [...]
      const rows: UserRow[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : [];

      if (!Array.isArray(data) && !Array.isArray(data?.users)) {
        // This is the most common silent failure: the request succeeded,
        // but the payload shape didn't match what we expected.
        console.warn("Unexpected /api/users response shape:", data);
      }

      setUsers(rows);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Log the real error — CORS failures, mixed-content blocks, and
      // DNS/connection errors all get swallowed if you don't do this.
      console.error("Failed to load users:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load users right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  };

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditRole(user.role);
    setSaveError("");
  };

  const closeEdit = () => {
    if (saving) return;
    setEditingUser(null);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(`${API_BASE}/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editUsername, role: editRole }),
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      // Optimistically update local state instead of re-fetching everything.
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, username: editUsername, role: editRole }
            : u
        )
      );
      setEditingUser(null);
      setToastOpen(true);
    } catch (err) {
      console.error("Failed to update user:", err);
      setSaveError(
        err instanceof Error ? err.message : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Account List
      </Typography>

      <Box sx={{ pt: 2 }}>
        <Paper sx={{ width, overflow: "hidden" }}>
          <TableContainer>
            <Table size="small" aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "error.main" }}>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label={`edit ${user.username}`}
                          onClick={() => openEdit(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Edit dialog */}
      <Dialog open={Boolean(editingUser)} onClose={closeEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit User {editingUser ? `#${editingUser.id}` : ""}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {saveError && <Alert severity="error">{saveError}</Alert>}
          <TextField
            label="Username"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            autoFocus
            fullWidth
            disabled={saving}
          />
          <TextField
            select
            label="Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            fullWidth
            disabled={saving}
          >
            {ROLE_OPTIONS.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !editUsername.trim()}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        message="User updated"
      />
    </>
  );
}