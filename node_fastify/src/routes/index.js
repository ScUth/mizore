import authRoutes from './auth.routes.js'
import fileRoutes from './file.routes.js'
import pathRoutes from './path.routes.js'
import userRoutes from './user.routes.js'

export default async function routes(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        reply.send({ hello: 'world' })
    })

    await fastify.register(authRoutes)
    await fastify.register(userRoutes)
    await fastify.register(pathRoutes)
    await fastify.register(fileRoutes)
}