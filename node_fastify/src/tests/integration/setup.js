import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

export const sharedFolder = await mkdtemp(path.join(os.tmpdir(), 'mizore-integration-'))
process.env.SHARED_FOLDER = sharedFolder

const { default: buildApp } = await import('../../app.js')
export const app = await buildApp()

export async function closeTestApp() {
    await app.close()
    await rm(sharedFolder, { recursive: true, force: true })
}
