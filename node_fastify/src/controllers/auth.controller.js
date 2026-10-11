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
