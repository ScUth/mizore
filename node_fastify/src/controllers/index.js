import * as fileService from '../services/index.js'

export async function getFile(request, reply) {
    const { filename } = request.params
    const filePath = fileService.getFilePath(filename)
    return reply.sendFile(filename) // fastify-static resolves relative to its registered root
}

export async function listFiles(request, reply) {
    try {
        const files = await fileService.listFiles()
        reply.send({ files })
    } catch (error) {
        request.log.error(error)
        reply.status(500).send({ error: 'Failed to list files' })
    }
}