import * as controllers from '../controllers/index.js'

export default async function routes(fastify, opts) {
    fastify.get('/', async (request, reply) => {
        reply.send({ hello: 'world' })
    })

    // User
    fastify.get('/api/me', { preHandler: [controllers.authenticate] }, controllers.getCurrentUser)
    fastify.get('/api/users', { preHandler: [controllers.requireAdmin] }, controllers.getAllUsers)
    fastify.get('/api/users/:username', { preHandler: [controllers.requireAdmin] }, controllers.getUserByUsername)
    
    fastify.post('/api/login', controllers.loginUser)
    fastify.post('/api/users/createdUser', controllers.createUser)
    fastify.post("/api/users/createdSubUser", { preHandler: [controllers.requireAdmin] }, controllers.createdSubUser)
    
    fastify.delete('/api/users/:id', { preHandler: [controllers.requireAdmin] }, controllers.deleteUser)
    
    fastify.patch('/api/users/:id', { preHandler: [controllers.requireAdmin] }, controllers.updateUser)
    
    fastify.put('/api/users/:id', { preHandler: [controllers.requireAdmin] }, controllers.updateUser)
    
    // Path
    fastify.get('/api/files/:filename', controllers.getFile)
    fastify.get('/api/list/:file', controllers.listFiles)
    fastify.get('/api/paths/:userId', { preHandler: [controllers.authenticate] }, controllers.getAllPathsByUserId)

    fastify.post('/api/paths', { preHandler: [controllers.authenticate] }, controllers.createPath)
}