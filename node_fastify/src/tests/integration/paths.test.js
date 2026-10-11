import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { app, closeTestApp } from './setup.js'

after(closeTestApp)

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
