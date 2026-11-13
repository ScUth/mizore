import * as fileService from '../services/file.service.js'

const BAD_PATH_ERRORS = ['Path is required', 'Path is outside the shared folder']

function sendPathError(request, reply, error, fallbackMessage) {
    if (error instanceof Error && BAD_PATH_ERRORS.includes(error.message)) {
        return reply.status(400).send({ error: error.message })
    }
    if (error?.code === 'ENOENT') {
        return reply.status(404).send({ error: 'Path does not exist' })
    }
    if (error?.code === 'ENOTDIR') {
        return reply.status(400).send({ error: 'Path must be a directory' })
    }
    request.log.error(error)
    return reply.status(500).send({ error: fallbackMessage })
}

export async function getFile(request, reply) {
    const { filename } = request.params
    try {
        const { root, relativePath } = fileService.getFilePath(filename)
        return reply.sendFile(relativePath, root)
    } catch (error) {
        return sendPathError(request, reply, error, 'Failed to get file')
    }
}

export async function listFiles(request, reply) {
    const { file } = request.params
    try {
        const files = await fileService.listFiles(file)
        reply.send({ files })
    } catch (error) {
        return sendPathError(request, reply, error, 'Failed to list files')
    }
}
