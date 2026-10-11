import * as pathControllers from '../controllers/path.controller.js'
import * as authControllers from '../controllers/auth.controller.js'

export default async function pathRoutes(fastify, opts) {
    fastify.get('/api/paths/:userId', { preHandler: [authControllers.authenticate] }, pathControllers.getAllPathsByUserId)
    fastify.post('/api/paths', { preHandler: [authControllers.authenticate] }, pathControllers.createPath)
}
