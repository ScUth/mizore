import * as authControllers from '../controllers/auth.controller.js'
import * as userControllers from '../controllers/user.controller.js'

export default async function authRoutes(fastify, opts) {
    fastify.post('/api/login', authControllers.loginUser)
    fastify.get('/api/me', { preHandler: [authControllers.authenticate] }, userControllers.getCurrentUser)
}
