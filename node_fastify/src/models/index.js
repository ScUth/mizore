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
    }
}