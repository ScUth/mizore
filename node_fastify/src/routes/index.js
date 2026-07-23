import * as filesController from '../controllers/index.js'

export default async function routes(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        reply.send({ hello: 'world' })
    })

    fastify.get('/api/files/:filename', filesController.getFile)
    fastify.get('/api/list/:file', filesController.listFiles)
}