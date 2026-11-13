import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { after, test } from 'node:test'
import { generateAccessToken } from '../../utils/jwt.js'
import { app, closeTestApp, secondSharedFolder, sharedFolder } from './setup.js'

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

test('listing files works with an absolute path inside any configured root', async () => {
    const moviesFolder = path.join(secondSharedFolder, 'movies')
    await mkdir(moviesFolder)
    await writeFile(path.join(moviesFolder, 'film.mkv'), 'Film contents')

    // The frontend strips the leading slash, so send it without one.
    const relativeToFs = moviesFolder.replace(/^\/+/, '')
    const response = await app.inject({
        method: 'GET',
        url: `/api/list/${encodeURIComponent(relativeToFs)}`,
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { files: ['film.mkv'] })
})

test('downloading a file from the second root returns its contents', async () => {
    const filePath = path.join(secondSharedFolder, 'notes.txt')
    await writeFile(filePath, 'Notes contents')

    const response = await app.inject({
        method: 'GET',
        url: `/api/files/${encodeURIComponent(filePath)}`,
    })

    assert.equal(response.statusCode, 200)
    assert.equal(response.body, 'Notes contents')
})

test('listing files rejects paths outside every configured root', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/list/${encodeURIComponent('../../etc')}`,
    })

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.json(), { error: 'Path is outside the shared folder' })
})

test('downloading a file rejects paths outside every configured root', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/files/${encodeURIComponent('/etc/passwd')}`,
    })

    // "/etc/passwd" is not under a root, so it is treated as relative to the first root.
    assert.equal(response.statusCode, 404)
})

test('listing sources rejects a request without a token', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/sources' })

    assert.equal(response.statusCode, 401)
})

test('listing sources returns every configured root', async () => {
    const token = generateAccessToken({ id: 1, username: 'member', role: 'user' })
    const response = await app.inject({
        method: 'GET',
        url: '/api/sources',
        headers: { authorization: `Bearer ${token}` },
    })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { sources: [sharedFolder, secondSharedFolder] })
})
