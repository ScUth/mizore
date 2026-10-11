import * as controllers from '../controllers/index.js'

export default async function userRoutes(fastify, opts) {
    fastify.get('/api/users', { preHandler: [controllers.requireAdmin] }, controllers.getAllUsers)
    fastify.get('/api/users/:username', { preHandler: [controllers.requireAdmin] }, controllers.getUserByUsername)
    fastify.post('/api/users/createdUser', controllers.createUser)
    fastify.post('/api/users/createdSubUser', { preHandler: [controllers.requireAdmin] }, controllers.createdSubUser)
    fastify.delete('/api/users/:id', { preHandler: [controllers.requireAdmin] }, controllers.deleteUser)
    fastify.patch('/api/users/:id', { preHandler: [controllers.requireAdmin] }, controllers.updateUser)
    fastify.put('/api/users/:id', { preHandler: [controllers.requireAdmin] }, controllers.updateUser)
}
