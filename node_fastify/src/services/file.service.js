import fs from 'node:fs/promises'
import { resolveSharedPath } from '../config/storage.js'

export async function listFiles(folder) {
    const { absolutePath } = resolveSharedPath(folder)
    return fs.readdir(absolutePath)
}

export function getFilePath(filename) {
    return resolveSharedPath(filename)
}
