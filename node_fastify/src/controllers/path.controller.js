import * as pathService from '../services/path.service.js'

export async function createPath(request, reply) {
    const { name, path, user_id, allowed_subpath } = request.body ?? {}
    const pathData = {
        name,
        path,
        user_id: user_id ?? request.user?.id,
        allowed_subpath,
    }

    if (!pathData.name || !pathData.path || !pathData.user_id) {
        return reply.status(400).send({ error: 'Name, path, and user_id are required' })
    }

    try {
        const newPath = await pathService.createPath(pathData)
        reply.status(201).send({ path: newPath })
    } catch (error) {
        request.log.error(error)

        if (error instanceof Error && ['Path does not exist', 'Path must be a directory', 'Path is outside the shared folder'].includes(error.message)) {
            return reply.status(400).send({ error: error.message })
        }

        return reply.status(500).send({ error: 'Failed to create path' })
    }
}

export async function getAllPathsByUserId(request, reply) {
    const { userId } = request.params;

    if (!userId) {
        return reply.status(400).send({ error: 'User ID is required' });
    }

    try {
        const paths = await pathService.getAllPathsByUserId(userId);
        reply.send({ paths });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to retrieve paths' });
    }
}

export async function deletePath(request, reply) {
    const { id } = request.params ?? {}
    if (!id) {
        return reply.status(400).send({ error: 'Path ID is required' });
    }

    try {
        const deleted = await pathService.deletePath(id);
        if (!deleted) {
            return reply.status(404).send({ error: 'Path not found' });
        }
        reply.send({ message: 'Path deleted successfully' });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to delete path' });
    }
}

export async function updatePath(request, reply) {
    const { id } = request.params ?? {}
    const { name, path, allowed_subpath } = request.body ?? {}

    if (!id) {
        return reply.status(400).send({ error: 'Path ID is required' });
    }

    if (!name || !path) {
        return reply.status(400).send({ error: 'Name and path are required' });
    }

    try {
        const updated = await pathService.updatePath(
            id,
            name,
            path,
            typeof allowed_subpath === 'boolean' ? allowed_subpath : null,
        );
        if (!updated) {
            return reply.status(404).send({ error: 'Path not found' });
        }
        reply.send({ message: 'Path updated successfully' });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: 'Failed to update path' });
    }
}