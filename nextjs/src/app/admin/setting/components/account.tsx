"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
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

type SortField = "id" | "username" | "role" | "created_at";
type SortDirection = "asc" | "desc";

// Prefer an env var so this isn't hardcoded to one machine's LAN IP.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("accessToken") ?? "";
}

function decodeTokenPayload(token: string | null) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized);
    return JSON.parse(decoded) as { id?: number; username?: string; role?: string };
  } catch {
    return null;
  }
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const token = getStoredToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

const ROLE_OPTIONS = ["admin", "user"];
const CREATE_ROLE_OPTIONS = ["admin", "user"];

// ---- Design tokens -------------------------------------------------------
// Clean, minimal admin surface: white/near-white ground, hairline borders
// instead of shadows, one restrained accent used only for primary actions,
// focus states, and the active sort indicator.
const tokens = {
  border: "#E4E4E7", // zinc-200
  borderStrong: "#D4D4D8", // zinc-300
  surface: "#FFFFFF",
  surfaceSubtle: "#FAFAFA",
  textPrimary: "#18181B", // zinc-900
  textSecondary: "#71717A", // zinc-500
  accent: "#4F46E5", // indigo-600
  accentSoft: "#EEF2FF",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
};

// A small, muted palette for identity avatars — enough variety to
// distinguish people at a glance without adding visual noise.
const AVATAR_PALETTE = [
  { bg: "#EEF2FF", fg: "#4338CA" },
  { bg: "#ECFDF5", fg: "#047857" },
  { bg: "#FFF7ED", fg: "#C2410C" },
  { bg: "#FDF2F8", fg: "#BE185D" },
  { bg: "#F0F9FF", fg: "#0369A1" },
  { bg: "#FEFCE8", fg: "#A16207" },
];

function avatarColors(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export default function Account({ width = "100%" }: AccountProps) {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // Toolbar: search, filter, sort, pagination
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [sortField, setSortField] = React.useState<SortField>("id");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Edit dialog state
  const [editingUser, setEditingUser] = React.useState<UserRow | null>(null);
  const [editUsername, setEditUsername] = React.useState("");
  const [editRole, setEditRole] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [createUsername, setCreateUsername] = React.useState("");
  const [createPassword, setCreatePassword] = React.useState("");
  const [createRole, setCreateRole] = React.useState("user");
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState("");

  // Delete dialog state
  const [deletingUser, setDeletingUser] = React.useState<UserRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  // Toast
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastOpen, setToastOpen] = React.useState(false);

  const loadUsers = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        cache: "no-store",
        headers: getAuthHeaders(),
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
        console.warn("Unexpected /api/users response shape:", data);
      }

      setUsers(rows);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
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
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  // ---- Derived: filter -> sort -> paginate ----
  const filteredUsers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || u.username.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const sortedUsers = React.useMemo(() => {
    const rows = [...filteredUsers];
    rows.sort((a, b) => {
      let av: string | number = a[sortField] ?? "";
      let bv: string | number = b[sortField] ?? "";
      if (sortField === "id") {
        av = a.id;
        bv = b.id;
      } else {
        av = String(av).toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [filteredUsers, sortField, sortDirection]);

  const paginatedUsers = React.useMemo(() => {
    const start = page * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, page, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  React.useEffect(() => {
    setPage(0);
  }, [search, roleFilter]);

  // ---- Create ----
  const openCreateDialog = () => {
    setCreateUsername("");
    setCreatePassword("");
    setCreateRole("user");
    setCreateError("");
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    if (creating) return;
    setCreateDialogOpen(false);
    setCreateError("");
  };

  const handleCreate = async () => {
    const username = createUsername.trim();
    const password = createPassword.trim();
    const parentUserId = decodeTokenPayload(getStoredToken())?.id;

    if (!username || !password) {
      setCreateError("Username and password are required.");
      return;
    }

    if (parentUserId == null) {
      setCreateError("Unable to determine the current logged in user.");
      return;
    }

    // Prevent duplicate usernames (case-insensitive) on the client-side
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      setCreateError("Username already exists.");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const response = await fetch(`${API_BASE}/api/users/createdSubUser`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ username, password, role: createRole, parentUserId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error ||
            (response.status === 409
              ? 'Username already exists.'
              : `Create failed with status ${response.status}`),
        );
      }

      const createdUser = data?.subUser ?? data;

      if (createdUser && typeof createdUser === "object") {
        setUsers((prev) => [createdUser as UserRow, ...prev]);
      }

      setCreateDialogOpen(false);
      showToast(`${username} was added`);
    } catch (err) {
      console.error("Failed to create user:", err);
      setCreateError(
        err instanceof Error ? err.message : "Unable to create account."
      );
    } finally {
      setCreating(false);
    }
  };

  // ---- Edit ----
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
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ username: editUsername, role: editRole }),
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, username: editUsername, role: editRole }
            : u
        )
      );
      setEditingUser(null);
      showToast("Changes saved");
    } catch (err) {
      console.error("Failed to update user:", err);
      setSaveError(
        err instanceof Error ? err.message : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete ----
  const openDelete = (user: UserRow) => {
    setDeletingUser(user);
    setDeleteError("");
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeletingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`${API_BASE}/api/users/${deletingUser.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      showToast(`${deletingUser.username} was removed`);
      setDeletingUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Unable to remove this user."
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns: { field: SortField; label: string }[] = [
    { field: "id", label: "ID" },
    { field: "username", label: "Username" },
    { field: "role", label: "Role" },
    { field: "created_at", label: "Joined" },
  ];

  return (
    <Box sx={{ width, fontFamily: "inherit" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{ color: tokens.textSecondary, letterSpacing: "0.08em", fontWeight: 600 }}
        >
          Access control
        </Typography>
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: tokens.textPrimary, letterSpacing: "-0.01em" }}>
            Accounts
            {!loading && (
              <Typography component="span" sx={{ color: tokens.textSecondary, fontWeight: 400, ml: 1.25, fontSize: "0.9em" }}>
                {users.length}
              </Typography>
            )}
          </Typography>
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon fontSize="small" />}
            onClick={openCreateDialog}
            sx={{
              bgcolor: tokens.accent,
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 1.5,
              px: 2,
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Add account
          </Button>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            minWidth: 240,
            "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: tokens.surface },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: tokens.textSecondary }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{
            minWidth: 150,
            "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: tokens.surface },
          }}
        >
          <MenuItem value="all">All roles</MenuItem>
          {ROLE_OPTIONS.map((role) => (
            <MenuItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      <Paper
        variant="outlined"
        sx={{ borderColor: tokens.border, borderRadius: 2, overflow: "hidden" }}
      >
        <TableContainer>
          <Table size="medium" aria-label="team members table">
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: tokens.surfaceSubtle, borderBottom: `1px solid ${tokens.border}` } }}>
                {columns.map((col) => (
                  <TableCell key={col.field} sx={{ py: 1.25 }}>
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDirection : "asc"}
                      onClick={() => handleSort(col.field)}
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: tokens.textSecondary,
                        "&.Mui-active": { color: tokens.textPrimary },
                        "& .MuiTableSortLabel-icon": { color: `${tokens.accent} !important` },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ py: 1.25, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: tokens.textSecondary }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: tokens.textSecondary, border: 0 }}>
                    Loading members…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, border: 0 }}>
                    <Typography sx={{ color: tokens.danger, fontWeight: 500 }}>{error}</Typography>
                    <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.5 }}>
                      Check your connection and try again.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, border: 0 }}>
                    <Typography sx={{ color: tokens.textPrimary, fontWeight: 500 }}>
                      No members match this filter
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.5 }}>
                      Try a different search term or clear the role filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const colors = avatarColors(user.username);
                  return (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        "& td": { borderBottom: `1px solid ${tokens.border}` },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ color: tokens.textSecondary }}>{user.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              bgcolor: colors.bg,
                              color: colors.fg,
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontWeight: 500, color: tokens.textPrimary }}>
                            {user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            bgcolor: user.role === "admin" ? tokens.accentSoft : tokens.surfaceSubtle,
                            color: user.role === "admin" ? tokens.accent : tokens.textSecondary,
                            fontWeight: 500,
                            textTransform: "capitalize",
                            border: `1px solid ${user.role === "admin" ? "#C7D2FE" : tokens.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: tokens.textSecondary }}>{formatDate(user.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" aria-label={`edit ${user.username}`} onClick={() => openEdit(user)}>
                            <EditOutlinedIcon fontSize="small" sx={{ color: tokens.textSecondary }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton size="small" aria-label={`remove ${user.username}`} onClick={() => openDelete(user)}>
                            <DeleteOutlinedIcon fontSize="small" sx={{ color: tokens.textSecondary }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && !error && sortedUsers.length > 0 && (
          <TablePagination
            component="div"
            count={sortedUsers.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: `1px solid ${tokens.border}`, color: tokens.textSecondary }}
          />
        )}
      </Paper>

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add account</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          {createError && <Alert severity="error">{createError}</Alert>}
          <TextField
            label="Username"
            value={createUsername}
            onChange={(e) => setCreateUsername(e.target.value)}
            autoFocus
            fullWidth
            disabled={creating}
          />
          <TextField
            label="Password"
            type="password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            fullWidth
            disabled={creating}
          />
          <TextField
            select
            label="Role"
            value={createRole}
            onChange={(e) => setCreateRole(e.target.value)}
            fullWidth
            disabled={creating}
          >
            {CREATE_ROLE_OPTIONS.map((role) => (
              <MenuItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCreateDialog} disabled={creating} sx={{ textTransform: "none", color: tokens.textSecondary }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disableElevation
            disabled={creating}
            sx={{ bgcolor: tokens.accent, textTransform: "none", "&:hover": { bgcolor: "#4338CA" } }}
          >
            {creating ? "Adding…" : "Add account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={Boolean(editingUser)} onClose={closeEdit} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Edit {editingUser ? editingUser.username : ""}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
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
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEdit} disabled={saving} sx={{ textTransform: "none", color: tokens.textSecondary }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disableElevation
            disabled={saving || !editUsername.trim()}
            sx={{ bgcolor: tokens.accent, textTransform: "none", "&:hover": { bgcolor: "#4338CA" } }}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deletingUser)} onClose={closeDelete} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Remove account</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography sx={{ color: tokens.textPrimary }}>
            {deletingUser?.username} will lose access immediately. This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDelete} disabled={deleting} sx={{ textTransform: "none", color: tokens.textSecondary }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disableElevation
            disabled={deleting}
            sx={{ bgcolor: tokens.danger, textTransform: "none", "&:hover": { bgcolor: "#B91C1C" } }}
          >
            {deleting ? "Removing…" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </Box>
  );
}