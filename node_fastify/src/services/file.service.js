import fs from 'fs/promises'
import path from 'path'
import config from '../config/storage.js'

const root = path.resolve(config.sharedFolder)

function resolveSafe(subPath = '') {
    const target = path.resolve(root, subPath)
    if (target !== root && !target.startsWith(root + path.sep)) {
        throw new Error('Invalid path')
    }
    return target
}

export async function listFiles(subPath = '') {
    return fs.readdir(resolveSafe(subPath))
}

export function getFilePath(subPath) {
    return resolveSafe(subPath)
}