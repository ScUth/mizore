import path from 'node:path'

// SHARED_FOLDERS: comma-separated list of allowed roots (e.g. "/home/yuki,/mnt/data").
// SHARED_FOLDER is still accepted for single-root setups.
const rawRoots = process.env.SHARED_FOLDERS || process.env.SHARED_FOLDER || '/files'

const sharedFolders = [...new Set(
    rawRoots
        .split(',')
        .map((root) => root.trim())
        .filter(Boolean)
        .map((root) => path.resolve(root))
)]

if (sharedFolders.length === 0) {
    sharedFolders.push(path.resolve('/files'))
}

function isInside(root, target) {
    return target === root || target.startsWith(root.endsWith(path.sep) ? root : root + path.sep)
}

/**
 * Resolve a user-supplied path to an absolute path inside one of the shared roots.
 *
 * Accepted forms:
 *  - an absolute path inside any root, with or without the leading slash
 *    ("/mnt/data/movies" or "mnt/data/movies" — the frontend strips leading slashes)
 *  - a path relative to the first root (legacy rows saved before multi-root support)
 *
 * Returns { root, absolutePath, relativePath }.
 */
export function resolveSharedPath(rawPath) {
    const trimmed = String(rawPath ?? '').trim()
    if (!trimmed) {
        throw new Error('Path is required')
    }

    const asAbsolute = path.resolve('/', trimmed)
    const matchingRoot = sharedFolders
        .filter((root) => isInside(root, asAbsolute))
        // Prefer the most specific root when roots are nested.
        .sort((a, b) => b.length - a.length)[0]

    if (matchingRoot) {
        return {
            root: matchingRoot,
            absolutePath: asAbsolute,
            relativePath: path.relative(matchingRoot, asAbsolute),
        }
    }

    const primaryRoot = sharedFolders[0]
    const asRelative = path.resolve(primaryRoot, trimmed.replace(/^[/\\]+/, ''))
    if (isInside(primaryRoot, asRelative)) {
        return {
            root: primaryRoot,
            absolutePath: asRelative,
            relativePath: path.relative(primaryRoot, asRelative),
        }
    }

    throw new Error('Path is outside the shared folder')
}

export default {
    sharedFolders,
    // Kept for code that still expects a single root.
    sharedFolder: sharedFolders[0],
}
