import * as controllers from '../controllers/index.js'

export default async function pathRoutes(fastify, opts) {
    fastify.get('/api/paths/:userId', { preHandler: [controllers.authenticate] }, controllers.getAllPathsByUserId)
    fastify.post('/api/paths', { preHandler: [controllers.authenticate] }, controllers.createPath)
}
