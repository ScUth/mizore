import * as controllers from '../controllers/index.js'

export default async function fileRoutes(fastify, opts) {
    fastify.get('/api/files/:filename', controllers.getFile)
    fastify.get('/api/list/:file', controllers.listFiles)
}
