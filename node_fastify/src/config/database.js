import Pool from 'pg'
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export async function query(text, params) {
    const start = Date.now()
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: result.rowCount })
    return result
}

export async function checkConnection() {
    const client = await pool.connect()
    try {
        await client.query('SELECT 1')
        return true
    } finally {
        client.release()
    }
}

export async function closePool() {
    await pool.end()
}

export default pool