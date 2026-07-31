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

export async function getUserByUsername(request, reply) {
    const { username } = request.params
    try {
        const user = await services.getUserByUsername(username)
        if (!user) {
            return reply.status(404).send({ error: 'User not found' })
        }
        const { password: _password, ...safeUser } = user
        return reply.send({ user: safeUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to retrieve user' })
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
    const user = { username: request.body.username, password: request.body.password, role: request.body.role };
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
    const { username, password } = request.body ?? {}

    if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password are required' })
    }

    try {
        const user = await services.getUserByUsername(username)
        if (!user) {
            return reply.status(401).send({ error: 'Invalid username or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return reply.status(401).send({ error: 'Invalid username or password' })
        }

        const { password: _password, ...safeUser } = user
        return reply.send({ message: 'Login successful', user: safeUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to login user' })
    }
}

export async function deleteUser(request, reply) {
    const { id } = request.params ?? {}

    if (!id) {
        return reply.status(400).send({ error: 'User ID is required' })
    }

    try {
        const deletedUser = await services.deleteUserById(id)
        if (!deletedUser) {
            return reply.status(404).send({ error: 'User not found' })
        }
        return reply.send({ message: 'User deleted successfully', user: deletedUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to delete user' })
    }
}

export async function updateUser(request, reply) {
    const { id } = request.params ?? {}
    const user = { username: request.body.username, password: request.body.password, role: request.body.role }

    if (!id) {
        return reply.status(400).send({ error: 'User ID is required' })
    }

    try {
        if (user.password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(user.password, salt)
            user.password = hashedPassword
        }

        const updatedUser = await services.updateUserById(id, user)
        if (!updatedUser) {
            return reply.status(404).send({ error: 'User not found' })
        }
        return reply.send({ message: 'User updated successfully', user: updatedUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to update user' })
    }
}