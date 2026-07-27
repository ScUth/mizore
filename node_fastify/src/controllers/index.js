import * as services from '../services/index.js'
import bcrypt from 'bcrypt'

export async function getFile(request, reply) {
    const { filename } = request.params
    const filePath = services.getFilePath(filename)
    return reply.sendFile(filename) // fastify-static resolves relative to its registered root
}

export async function listFiles(request, reply) {
    const { file } = request.params
    try {
        const files = await services.listFiles(file)
        reply.send({ files })
    } catch (error) {
        request.log.error(error)
        reply.status(500).send({ error: 'Failed to list files' })
    }
}

export async function getAllUsers(request, reply) {
    try {
        const users = await services.getAllUsers();
        reply.send({ users });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to retrieve users' });
    }
}

export async function createUser(request, reply) {
    const user = {username: request.params.username, password: request.params.password, role: request.params.role};
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        const newUser = await services.createUser(user);
        reply.status(201).send({ user: newUser });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to create user' });
}
}

export async function loginUser(request, reply) {
    const { username, password } = request.body;
    try {
        const user = await services.getUserByUsername(username);
        if (!user) {
            return reply.status(401).send({ error: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return reply.status(401).send({ error: 'Invalid username or password' });
        }
        // Here you would typically generate a JWT token and send it back to the client
        reply.send({ message: 'Login successful', user });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to login user' });
    }
}