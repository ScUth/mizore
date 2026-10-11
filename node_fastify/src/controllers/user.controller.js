import bcrypt from 'bcrypt'
import { authenticate as authenticateUser } from './auth.controller.js'
import * as userService from '../services/user.service.js'

export { authenticateUser as authenticate }
export * from './path.controller.js'

export async function getUserByUsername(request, reply) {
    const { username } = request.params
    try {
        const user = await userService.getUserByUsername(username)
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

export async function requireAdmin(request, reply) {
    const isAuthenticated = await authenticateUser(request, reply)
    if (!isAuthenticated) {
        return false
    }

    if (request.user?.role !== 'admin' && request.user?.role !== 'owner') {
        reply.status(403).send({ error: 'Admin access required' })
        return false
    }

    return true
}

export async function getCurrentUser(request, reply) {
    return reply.send({
        user: {
            id: request.user?.id,
            username: request.user?.username,
            role: request.user?.role,
        },
        message: 'Token is valid',
    })
}

export async function getAllUsers(request, reply) {
    try {
        const users = await userService.getAllUsers()
        reply.send({ users })
    } catch (error) {
        request.log.error(error)
        reply.status(500).send({ error: 'Failed to retrieve users' })
    }
}

export async function createUser(request, reply) {
    const user = {
        username: request.body.username,
        password: request.body.password,
        role: request.body.role,
    }

    if (!user.username || !user.password) {
        return reply.status(400).send({ error: 'Username and password are required' })
    }

    try {
        const usernameTaken = await userService.existsUsername(user.username)
        if (usernameTaken) {
            return reply.status(409).send({ error: 'Username already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        user.password = hashedPassword

        const newUser = await userService.createUser(user)
        return reply.status(201).send({ user: newUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to create user' })
    }
}

export async function deleteUser(request, reply) {
    const { id } = request.params ?? {}

    if (!id) {
        return reply.status(400).send({ error: 'User ID is required' })
    }

    try {
        const deletedUser = await userService.deleteUserById(id)
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
    const user = {
        username: request.body.username,
        password: request.body.password,
        role: request.body.role,
    }

    if (!id) {
        return reply.status(400).send({ error: 'User ID is required' })
    }

    try {
        if (user.password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(user.password, salt)
            user.password = hashedPassword
        }

        const updatedUser = await userService.updateUserById(id, user)
        if (!updatedUser) {
            return reply.status(404).send({ error: 'User not found' })
        }

        return reply.send({ message: 'User updated successfully', user: updatedUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to update user' })
    }
}
