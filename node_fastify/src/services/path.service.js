import fs from 'node:fs/promises'
import { Path } from '../models/user.model.js'
import { resolveSharedPath } from '../config/storage.js'

export async function createPath(pathData) {
    const { absolutePath: resolvedPath } = resolveSharedPath(pathData.path)

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

    return Path.create(
        pathData.name,
        pathData.path,
        pathData.user_id,
        pathData.allowed_subpath !== false,
    )
}

export async function getAllPathsByUserId(user_id) {
    return Path.getAllByUserId(user_id)
}

export async function deletePath(id) {
    return Path.deleteById(id)
}

export async function updatePath(id, name, path, allowed_subpath) {
    return Path.updateById(id, name, path, allowed_subpath)
}