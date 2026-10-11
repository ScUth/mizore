import { query } from '../config/database.js'

export const Path = {
    async findAll() {
        const { rows } = await query('SELECT id, name, path, user_id, allowed_subpath FROM paths ORDER BY id')
        return rows
    },

    async findById(id) {
        const { rows } = await query('SELECT id, name, path, user_id, allowed_subpath FROM paths WHERE id = $1', [id])
        return rows[0] || null
    },

    async create(name, path, user_id, allowed_subpath = true) {
        const { rows } = await query(
            'INSERT INTO paths (name, path, user_id, allowed_subpath) VALUES ($1, $2, $3, $4) RETURNING id, name, path, user_id, allowed_subpath',
            [name, path, user_id, allowed_subpath]
        )
        return rows[0]
    },

    async getAllByUserId(user_id) {
        const { rows } = await query('SELECT id, name, path, allowed_subpath FROM paths WHERE user_id = $1 ORDER BY id', [user_id])
        return rows
    },

    async deleteById(id) {
        const { rowCount } = await query('DELETE FROM paths WHERE id = $1', [id])
        return rowCount > 0
    },

    async updateById(id, name, path, allowed_subpath = null) {
        const { rowCount } = await query(
            'UPDATE paths SET name = $1, path = $2, allowed_subpath = COALESCE($3, allowed_subpath) WHERE id = $4',
            [name, path, allowed_subpath, id]
        )
        return rowCount > 0
    }
}