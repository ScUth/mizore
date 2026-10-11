import { verifyAccessToken } from '../utils/jwt.js'

export async function authenticate(request, reply) {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
        reply.status(401).send({ error: 'Authentication token is required' })
        return false
    }

    try {
        request.user = verifyAccessToken(authHeader.slice(7))
        return true
    } catch (error) {
        request.log.error(error)
        reply.status(401).send({ error: 'Invalid or expired token' })
        return false
    }
}

export async function loginUser(request, reply) {
    const { username, password } = request.body ?? {}

    if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password are required' })
    }

    try {
        const user = await userService.getUserByUsername(username)
        if (!user) {
            return reply.status(401).send({ error: 'Invalid username or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return reply.status(401).send({ error: 'Invalid username or password' })
        }

        const { password: _password, ...safeUser } = user
        const accessToken = generateAccessToken({ id: user.id, username: user.username, role: user.role })
        const refreshToken = generateRefreshToken({ id: user.id, username: user.username, role: user.role })

        return reply.send({ message: 'Login successful', user: safeUser, accessToken, refreshToken })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to login user' })
    }
}