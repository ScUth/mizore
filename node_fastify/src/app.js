import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import cors from '@fastify/cors'
import routes from './routes/index.js'
import config from './config/storage.js'

export default async function buildApp() {
    const fastify = Fastify({
        logger: true,
        routerOptions: { maxParamLength: 4096 },
    })

    await fastify.register(fastifyStatic, {
        // Files are only served through /api/files, which checks the path
        // against every configured root before calling reply.sendFile.
        root: config.sharedFolders,
        serve: false,
    })

    await fastify.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })

    await fastify.register(routes)

    return fastify
}