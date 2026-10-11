import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { app, closeTestApp } from './setup.js'

after(closeTestApp)

test('creating a user rejects missing credentials', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/users/createdUser',
        payload: { username: '', password: '' },
    })

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.json(), { error: 'Username and password are required' })
})

test('admin-only user listing rejects a request without a token', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/users' })

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Authentication token is required' })
})

test('admin-only user listing rejects a non-admin user', async () => {
    const { generateAccessToken } = await import('../../utils/jwt.js')
    const token = generateAccessToken({ id: 1, username: 'member', role: 'user' })
    const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: `Bearer ${token}` },
    })

    assert.equal(response.statusCode, 403)
    assert.deepEqual(response.json(), { error: 'Admin access required' })
})
