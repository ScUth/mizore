import * as fileService from '../services/file.service.js'

export async function getFile(request, reply) {
    const { filename } = request.params
    return reply.sendFile(filename)
}

export async function listFiles(request, reply) {
    const { file } = request.params
    try {
        const files = await fileService.listFiles(file)
        reply.send({ files })
    } catch (error) {
        request.log.error(error)
        reply.status(500).send({ error: 'Failed to list files' })
    }
}