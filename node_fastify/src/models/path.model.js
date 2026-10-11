import { query } from '../config/database.js'

export const Path = {
    async findAll() {
        const { rows } = await query('SELECT id, name, path, user_id FROM paths ORDER BY id')
        return rows
    },

    async findById(id) {
        const { rows } = await query('SELECT id, name, path, user_id FROM paths WHERE id = $1', [id])
        return rows[0] || null
    },

    async create(name, path, user_id) {
        const { rows } = await query(
            'INSERT INTO paths (name, path, user_id) VALUES ($1, $2, $3) RETURNING id, name, path, user_id',
            [name, path, user_id]
        )
        return rows[0]
    },

    async getAllByUserId(user_id) {
        const { rows } = await query('SELECT id, name, path FROM paths WHERE user_id = $1 ORDER BY id', [user_id])
        return rows
    },

    async deleteById(id) {
        const { rowCount } = await query('DELETE FROM paths WHERE id = $1', [id])
        return rowCount > 0
    },

    async updateById(id, name, path) {
        const { rowCount } = await query(
            'UPDATE paths SET name = $1, path = $2 WHERE id = $3',
            [name, path, id]
        )
        return rowCount > 0
    }
}