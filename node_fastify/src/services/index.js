// Logic
import fs from 'fs/promises'
import path from 'path'
import config from '../config/storage.js'

export async function listFiles() {
    return fs.readdir(config.sharedFolder)
}

export function getFilePath(filename) {
    // basic safety: prevent path traversal like ../../etc/passwd
    const safeName = path.basename(filename)
    return path.join(config.sharedFolder, safeName)
}