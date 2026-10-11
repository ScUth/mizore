import { User, subUser } from '../models/user.model.js'

export async function getAllUsers() {
    return User.findAll()
}

export async function getUserById(id) {
    return User.findById(id)
}

export async function getUserByUsername(username) {
    return User.findByUsername(username)
}

export async function existsUsername(username) {
    const [userExists, subUserExists] = await Promise.all([
        User.existsByUsername(username),
        subUser.existsByUsername(username),
    ])

    return userExists || subUserExists
}

export async function createUser(user) {
    return User.create(user.username, user.password, user.role)
}

export async function deleteUserById(id) {
    return User.deleteById(id)
}

export async function updateUserById(id, user) {
    return User.updateById(id, user.username, user.password, user.role)
}

export async function createSubUser(subUserData) {
    return subUser.create(
        subUserData.username,
        subUserData.password,
        subUserData.role,
        subUserData.parentUserId
    )
}
