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

test('listing files supports long encoded nested paths', async () => {
    const relativeFolder = [
        'sdb931',
        'Anime (DL)',
        'Anime Audio Download Music',
        'Anime-Haruhi Music',
        'Melancholy of Haruhi Suzumiya',
        'SHYu - Haruhi no Kioku',
    ].join('/')
    const targetFolder = path.join(sharedFolder, ...relativeFolder.split('/'))
    await mkdir(targetFolder, { recursive: true })
    await writeFile(path.join(targetFolder, 'track.mp3'), 'Track contents')

    const response = await app.inject({
        method: 'GET',
        url: `/api/list/${encodeURIComponent(relativeFolder)}`,
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { files: ['track.mp3'] })
})

test('downloading a shared file returns its contents', async () => {
    await writeFile(path.join(sharedFolder, 'report.txt'), 'Report contents')

    const response = await app.inject({ method: 'GET', url: '/api/files/report.txt' })

    assert.equal(response.statusCode, 200)
    assert.equal(response.body, 'Report contents')
})
