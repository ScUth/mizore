import * as controllers from '../controllers/index.js'

export default async function authRoutes(fastify, opts) {
    fastify.post('/api/login', controllers.loginUser)
    fastify.get('/api/me', { preHandler: [controllers.authenticate] }, controllers.getCurrentUser)
}
