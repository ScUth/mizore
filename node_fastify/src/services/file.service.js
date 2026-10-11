import fs from 'fs/promises'
import path from 'path'
import config from '../config/storage.js'

export async function listFiles(file) {
    return fs.readdir(path.join(config.sharedFolder, file))
}

export function getFilePath(filename) {
    const safeName = path.basename(filename)
    return path.join(config.sharedFolder, safeName)
}
