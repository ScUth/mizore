import * as authControllers from '../controllers/auth.controller.js'

export default async function authRoutes(fastify, opts) {
    fastify.post('/api/login', authControllers.loginUser)
    fastify.get('/api/me', { preHandler: [authControllers.authenticate] }, authControllers.getCurrentUser)
}
