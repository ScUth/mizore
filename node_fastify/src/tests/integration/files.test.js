import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { after, test } from 'node:test'
import { app, closeTestApp, sharedFolder } from './setup.js'

after(closeTestApp)

test('listing files returns entries from the requested shared folder', async () => {
    const documentsFolder = path.join(sharedFolder, 'documents')
    await mkdir(documentsFolder)
    await writeFile(path.join(documentsFolder, 'report.txt'), 'Report contents')

    const response = await app.inject({ method: 'GET', url: '/api/list/documents' })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { files: ['report.txt'] })
})

test('downloading a shared file returns its contents', async () => {
    await writeFile(path.join(sharedFolder, 'report.txt'), 'Report contents')

    const response = await app.inject({ method: 'GET', url: '/api/files/report.txt' })

    assert.equal(response.statusCode, 200)
    assert.equal(response.body, 'Report contents')
})
