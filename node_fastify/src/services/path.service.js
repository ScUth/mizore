import fs from 'node:fs/promises'
import path from 'node:path'
import { Path } from '../models/user.model.js'
import config from '../config/storage.js'

function resolveSharedPath(rawPath) {
    const sharedRoot = path.resolve(config.sharedFolder)
    const normalizedPath = String(rawPath ?? '').trim().replace(/^[/\\]+/, '')

    if (!normalizedPath) {
        throw new Error('Path is required')
    }

    const resolvedPath = path.resolve(sharedRoot, normalizedPath)

    if (resolvedPath !== sharedRoot && !resolvedPath.startsWith(sharedRoot + path.sep)) {
        throw new Error('Path is outside the shared folder')
    }

    return resolvedPath
}

export async function createPath(pathData) {
    const resolvedPath = resolveSharedPath(pathData.path)

    try {
        const stats = await fs.stat(resolvedPath)
        if (!stats.isDirectory()) {
            throw new Error('Path must be a directory')
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error('Path does not exist')
        }
        if (error instanceof Error && error.message !== 'Path must be a directory' && error.message !== 'Path is outside the shared folder') {
            throw error
        }
        throw error
    }

    return Path.create(pathData.name, pathData.path, pathData.user_id)
}

export async function getAllPathsByUserId(user_id) {
    return Path.getAllByUserId(user_id)
}

export async function deletePath(id) {
    return Path.deleteById(id)
}

export async function updatePath(id, name, path) {
    return Path.updateById(id, name, path)
}