import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { app, closeTestApp } from './setup.js'

after(closeTestApp)

test('GET / returns the service welcome response', async () => {
    const response = await app.inject({ method: 'GET', url: '/' })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { hello: 'world' })
})
