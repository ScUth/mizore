import 'dotenv/config'
import jwt from 'jsonwebtoken'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'

export const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_ACCESS_SECRET, { expiresIn: '1h' })
}

export const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_ACCESS_SECRET)
}

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET)
}