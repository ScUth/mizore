import { query } from '../config/database.js'

export const subUser = {
    async findAll() {
        const { rows } = await query('SELECT id, name AS username, role, created_at FROM subUsers ORDER BY id')
        return rows
    },

    async findById(id) {
        const { rows } = await query('SELECT id, name AS username, role, created_at FROM subUsers WHERE id = $1', [id])
        return rows[0] || null
    },

    async existsByUsername(username) {
        const { rows } = await query('SELECT 1 FROM subUsers WHERE LOWER(name) = LOWER($1) LIMIT 1', [username])
        return rows.length > 0
    },

    async create(username, password, role, parentUserId) {
        const { rows } = await query(
            'INSERT INTO subUsers (name, password, role, user_id) VALUES ($1, $2, $3, $4) RETURNING id, name AS username, role, created_at',
            [username, password, role, parentUserId]
        )
        return rows[0]
    },
}