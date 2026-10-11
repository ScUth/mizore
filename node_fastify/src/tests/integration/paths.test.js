import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { Path } from '../../models/path.model.js'
import { generateAccessToken } from '../../utils/jwt.js'
import { app, closeTestApp } from './setup.js'

after(closeTestApp)

const token = generateAccessToken({ id: 1, username: 'member', role: 'user' })
const headers = { authorization: `Bearer ${token}` }

test('listing paths rejects a request without a token', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/paths/1',
    })

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Authentication token is required' })
})

test('creating a path rejects a request without a token', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/paths',
        payload: { name: 'Documents', path: '/documents', user_id: 1 },
    })



    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Authentication token is required' })
})

test('updating a path rejects a request without a token', async () => {
    const response = await app.inject({
        method: 'PATCH',
        url: '/api/paths/1',
        payload: { name: 'Documents', path: '/documents' },
    })

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Authentication token is required' })
})

test('updating a path requires a name and path', async () => {
    const response = await app.inject({
        method: 'PATCH',
        url: '/api/paths/1',
        headers,
        payload: {},
    })

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.json(), { error: 'Name and path are required' })
})

test('updating a path updates the matching record', async (t) => {
    let receivedArgs
    t.mock.method(Path, 'updateById', async (...args) => {
        receivedArgs = args
        return true
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/paths/7',
        headers,
        payload: { name: 'Work', path: '/work' },
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { message: 'Path updated successfully' })
    assert.deepEqual(receivedArgs, ['7', 'Work', '/work', null])
})

test('updating a path saves whether child folders are allowed', async (t) => {
    let receivedArgs
    t.mock.method(Path, 'updateById', async (...args) => {
        receivedArgs = args
        return true
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/paths/7',
        headers,
        payload: {
            name: 'Work',
            path: '/work',
            allowed_subpath: false,
        },
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(receivedArgs, ['7', 'Work', '/work', false])
})

test('updating a path returns not found when the record does not exist', async (t) => {
    t.mock.method(Path, 'updateById', async () => false)

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/paths/7',
        headers,
        payload: { name: 'Work', path: '/work' },
    })

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.json(), { error: 'Path not found' })
})

test('deleting a path rejects a request without a token', async () => {
    const response = await app.inject({
        method: 'DELETE',
        url: '/api/paths/1',
    })

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Authentication token is required' })
})

test('deleting a path deletes the matching record', async (t) => {
    let receivedId
    t.mock.method(Path, 'deleteById', async (id) => {
        receivedId = id
        return true
    })

    const response = await app.inject({
        method: 'DELETE',
        url: '/api/paths/7',
        headers,
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { message: 'Path deleted successfully' })
    assert.equal(receivedId, '7')
})

test('deleting a path returns not found when the record does not exist', async (t) => {
    t.mock.method(Path, 'deleteById', async () => false)

    const response = await app.inject({
        method: 'DELETE',
        url: '/api/paths/7',
        headers,
    })

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.json(), { error: 'Path not found' })
})
