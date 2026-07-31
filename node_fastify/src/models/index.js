import { query } from "../config/database.js";

export const User = {
    async findAll() {
        const { rows } = await query('SELECT id, username, role, created_at FROM users ORDER BY id');
        return rows;
    },

    async findById(id) {
        const { rows } = await query('SELECT id, username, role, created_at FROM users WHERE id = $1', [id]);
        return rows[0] || null;
    },

    async create(username, password, role) {
        const { rows } = await query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
            [username, password, role]
        );
        return rows[0];
    },

    async findByUsername(username) {
        const { rows } = await query('SELECT id, username, password, role, created_at FROM users WHERE username = $1', [username]);
        return rows[0] || null;
    },

    async deleteById(id) {
        const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id, username, role, created_at', [id]);
        return rows[0] || null;
    },

    async updateById(id, username, password, role) {
        const { rows } = await query(
            'UPDATE users SET username = $1, password = $2, role = $3 WHERE id = $4 RETURNING id, username, role, created_at',
            [username, password, role, id]
        );
        return rows[0] || null;
    }
}

export const Path = {
    async findAll() {
        const { rows } = await query('SELECT id, name, path, user_id FROM paths ORDER BY id');
        return rows;
    },

    async findById(id) {
        const { rows } = await query("select id, name, path, user_id from paths where id = $1", [id]);
        return rows[0] || null;
    },

    async create(name, path, user_id) {
        const { rows } = await query(
            "insert into paths (name, path, user_id) values ($1, $2, $3) returning id, name, path, user_id",
            [name, path, user_id]
        );
        return rows[0];
    }
}