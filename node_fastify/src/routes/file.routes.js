import * as fileControllers from '../controllers/file.controller.js'

export default async function fileRoutes(fastify, opts) {
    fastify.get('/api/files/:filename', fileControllers.getFile)
    fastify.get('/api/list/:file', fileControllers.listFiles)
}
