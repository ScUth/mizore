// Logic (including database access) should be implemented here, not in the controller.
import fs from 'fs/promises'
import path from 'path'
import config from '../config/storage.js'

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