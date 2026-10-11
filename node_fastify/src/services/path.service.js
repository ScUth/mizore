import { Path } from '../models/user.model.js'

export async function createPath(pathData) {
    return Path.create(pathData.name, pathData.path, pathData.user_id)
}

export async function getAllPathsByUserId(user_id) {
    return Path.getAllByUserId(user_id)
}
