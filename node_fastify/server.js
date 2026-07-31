// ESM
import buildApp from './src/app.js'
import cors from '@fastify/cors'

const fastify = await buildApp()

fastify.register(cors, {origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']}); // for testing purposes, allow all origins and methods

fastify.listen({ port: process.env.PORT || 4000, host: process.env.HOST || '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})