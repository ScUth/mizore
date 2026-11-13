import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

export const sharedFolder = await mkdtemp(path.join(os.tmpdir(), 'mizore-integration-'))
export const secondSharedFolder = await mkdtemp(path.join(os.tmpdir(), 'mizore-integration-second-'))
process.env.SHARED_FOLDERS = `${sharedFolder},${secondSharedFolder}`

const { default: buildApp } = await import('../../app.js')
export const app = await buildApp()

export async function closeTestApp() {
    await app.close()
    await rm(sharedFolder, { recursive: true, force: true })
    await rm(secondSharedFolder, { recursive: true, force: true })
}
