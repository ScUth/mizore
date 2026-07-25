import * as services from '../services/index.js'

export async function getFile(request, reply) {
    const { filename } = request.params
    const filePath = services.getFilePath(filename)
    return reply.sendFile(filename) // fastify-static resolves relative to its registered root
}

export async function listFiles(request, reply) {
    const { file } = request.params
    try {
        const files = await services.listFiles(file)
        reply.send({ files })
    } catch (error) {
        request.log.error(error)
        reply.status(500).send({ error: 'Failed to list files' })
    }
}

export async function getAllUsers(request, reply) {
    try {
        const users = await services.getAllUsers();
        reply.send({ users });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to retrieve users' });
    }
}