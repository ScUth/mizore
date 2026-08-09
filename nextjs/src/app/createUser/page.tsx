"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.57:4000";

export default function CreateUserPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
  const [role, setRole] = useState("owner");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleRoleChange = (event: SelectChangeEvent<string>) => {
  //   setRole(event.target.value as string);
  // };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedUsername = username.trim();
		if (password !== confirmation) {
			setError("Password and Confirm must be the same!");
			return;
		}

    if (!trimmedUsername || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/users/createdUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error ||
            (response.status === 409
              ? 'Username already exists.'
              : `Unable to create user (${response.status})`),
        );
      }

      setSuccess(
        `User ${data.user?.username ?? trimmedUsername} created successfully.`,
      );
      setUsername("");
      setPassword("");
			setConfirmation("");
			// redirect("/login");
			window.location.assign("/login");
      // setRole("user");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Create User
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          ) : null}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
            {/* <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl> */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
