import bcrypt from 'bcrypt'
import * as userService from '../services/user.service.js'

export async function createdSubUser(request, reply) {
    const subUser = {
        username: request.body.username,
        password: request.body.password,
        role: request.body.role,
        parentUserId: request.body.parentUserId,
    }

    if (!subUser.username || !subUser.password) {
        return reply.status(400).send({ error: 'Username and password are required' })
    }

    try {
        const usernameTaken = await userService.existsUsername(subUser.username)
        if (usernameTaken) {
            return reply.status(409).send({ error: 'Username already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(subUser.password, salt)
        subUser.password = hashedPassword

        const newSubUser = await userService.createSubUser(subUser)
        return reply.status(201).send({ subUser: newSubUser })
    } catch (error) {
        request.log.error(error)
        return reply.status(500).send({ error: 'Failed to create sub-user' })
    }
}
