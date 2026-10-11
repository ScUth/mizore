import * as userControllers from '../controllers/user.controller.js'

export default async function userRoutes(fastify, opts) {
    fastify.get('/api/users', { preHandler: [userControllers.requireAdmin] }, userControllers.getAllUsers)
    fastify.get('/api/users/:username', { preHandler: [userControllers.requireAdmin] }, userControllers.getUserByUsername)
    fastify.post('/api/users/createdUser', userControllers.createUser)
    fastify.post('/api/users/createdSubUser', { preHandler: [userControllers.requireAdmin] }, userControllers.createdSubUser)
    fastify.delete('/api/users/:id', { preHandler: [userControllers.requireAdmin] }, userControllers.deleteUser)
    fastify.patch('/api/users/:id', { preHandler: [userControllers.requireAdmin] }, userControllers.updateUser)
    fastify.put('/api/users/:id', { preHandler: [userControllers.requireAdmin] }, userControllers.updateUser)
}
