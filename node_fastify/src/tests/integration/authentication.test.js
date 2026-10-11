import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { app, closeTestApp } from './setup.js'

after(closeTestApp)

test('login rejects requests without credentials', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/login',
        payload: {},
    })

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.json(), { error: 'Username and password are required' })
})

test('current-user endpoint rejects a request without a token', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/me' })

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Authentication token is required' })
})

test('current-user endpoint rejects an invalid token', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/me',
        headers: { authorization: 'Bearer invalid-token' },
    })

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.json(), { error: 'Invalid or expired token' })
})
