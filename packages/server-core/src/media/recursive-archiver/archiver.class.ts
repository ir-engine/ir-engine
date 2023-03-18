import { ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import appRootPath from 'app-root-path'
import JSZip from 'jszip'
import fetch from 'node-fetch'
import path from 'path/posix'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'
import { getStorageProvider } from '../storageprovider/storageprovider'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

/**
 * A class for Managing files in FileBrowser
 */

export class Archiver implements Partial<ServiceMethods<any>> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async setup(app: Application, path: string) {}

  async get(directory: string, params?: UserParams): Promise<string> {
    if (!params) params = {}
    if (!params.query) params.query = {}
    const { storageProviderName } = params.query

    delete params.query.storageProviderName

    const storageProvider = getStorageProvider(storageProviderName)
    if (directory[0] === '/') directory = directory.slice(1)

    let result = await storageProvider.listFolderContent(directory)

    const zip = new JSZip()

    for (let i = 0; i < result.length; i++) {
      if (result[i].type == 'folder') {
        let content = await storageProvider.listFolderContent(result[i].key)
        content.forEach((f) => {
          result.push(f)
        })
      }

      if (result[i].type == 'folder') continue

      const blobPromise = await fetch(result[i].url, { method: 'GET' }).then((r) => {
        if (r.status === 200) return r.arrayBuffer()
        return Promise.reject(new Error(r.statusText))
      })

      const dir = result[i].key.substring(result[i].key.indexOf('/') + 1)
      zip.file(dir, blobPromise)
    }

    const generated = await zip.generateAsync({ type: 'blob', streamFiles: true })

    const zipOutputDirectory = `'temp'${directory.substring(directory.lastIndexOf('/'))}.zip`

    await storageProvider.putObject({
      Key: zipOutputDirectory,
      Body: Buffer.from(await generated.arrayBuffer()),
      ContentType: 'archive/zip'
    })

    return zipOutputDirectory
  }
}
