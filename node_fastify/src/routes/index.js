import * as controllers from '../controllers/index.js'

export default async function routes(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        reply.send({ hello: 'world' })
    })

    fastify.get('/api/files/:filename', controllers.getFile)
    fastify.get('/api/list/:file', controllers.listFiles)
    fastify.get('/api/users', controllers.getAllUsers);
    fastify.post('/api/users/:username/:password/:role', controllers.createUser);
    fastify.post('/api/login', controllers.loginUser);
}