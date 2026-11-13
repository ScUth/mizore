import * as fileControllers from '../controllers/file.controller.js'
import * as authControllers from '../controllers/auth.controller.js'

export default async function fileRoutes(fastify, opts) {
    fastify.get('/api/sources', { preHandler: [authControllers.authenticate] }, fileControllers.listSources)
    fastify.get('/api/files/:filename', fileControllers.getFile)
    fastify.get('/api/list/:file', fileControllers.listFiles)
}
