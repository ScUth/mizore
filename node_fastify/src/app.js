import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import routes from './routes/index.js'
import config from './config/storage.js'

export default async function buildApp() {
    const fastify = Fastify({ logger: true })

    await fastify.register(fastifyStatic, {
        root: config.sharedFolder
    })

    await fastify.register(routes)

    return fastify
}