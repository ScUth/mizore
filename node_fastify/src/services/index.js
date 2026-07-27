// Logic (including database access) should be implemented here, not in the controller.
import fs from 'fs/promises'
import path from 'path'
import config from '../config/storage.js'
import models from '../models/index.js'

const { User } = models;

export async function listFiles(file) {
    return fs.readdir(path.join(config.sharedFolder, file))
}

export function getFilePath(filename) {
    // basic safety: prevent path traversal like ../../etc/passwd
    const safeName = path.basename(filename)
    return path.join(config.sharedFolder, safeName)
}

export async function getAllUsers() {
    return User.findAll();
}

export async function getUserById(id) {
    return User.findById(id);
}

export async function getUserByUsername(username) {
    // Assuming the User model has a method to find a user by username
    return User.findByUsername(username);
}

export async function createUser(user) {
    return User.create(user.username, user.password, user.role);
}