import * as pathService from '../services/path.service.js'

export async function createPath(request, reply) {
    const { name, path, user_id } = request.body ?? {}
    const pathData = {
        name,
        path,
        user_id: user_id ?? request.user?.id,
    }

    if (!pathData.name || !pathData.path || !pathData.user_id) {
        return reply.status(400).send({ error: 'Name, path, and user_id are required' })
    }

    try {
        const newPath = await pathService.createPath(pathData)
        reply.status(201).send({ path: newPath })
    } catch (error) {
        request.log.error(error)
        reply.status(500).send({ error: 'Failed to create path' })
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
