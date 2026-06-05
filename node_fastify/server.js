// ESM
import Fastify from 'fastify'
import dotenv from 'dotenv'

const fastify = Fastify({
    logger: true
})
dotenv.config()

// Declare a route
fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' })
})

// test
import path from 'path';
import fastifyStatic from '@fastify/static';
const SHARED_FOLDER = '/home/yuki'

await fastify.register(fastifyStatic, {
    root: SHARED_FOLDER,});

fastify.get('/api/files/:filename', function (request, reply) {
    const { filename } = request.params;
    reply.sendFile(filename);
});

// Run the server!
fastify.listen({ port: 3000, host: process.env.HOST }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
})