import * as controllers from '../controllers/index.js'

export default async function routes(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        reply.send({ hello: 'world' })
    })

    fastify.get('/api/files/:filename', controllers.getFile)
    fastify.get('/api/list/:file', controllers.listFiles)
    fastify.get('/api/users', controllers.getAllUsers);
    fastify.post('/api/users/createdUser', controllers.createUser);
    fastify.post('/api/login', controllers.loginUser);
    fastify.delete('/api/users/:id', controllers.deleteUser);
    fastify.put('/api/users/:id', controllers.updateUser);
}