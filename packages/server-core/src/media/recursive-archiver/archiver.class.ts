/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
    if (directory[0] === '/') directory = directory.slice(1)
    if (!directory.startsWith('projects/') || ['projects', 'projects/'].includes(directory)) {
      return Promise.reject(new Error('Cannot archive non-project directories'))
    }

    if (!params) params = {}
    if (!params.query) params.query = {}
    const { storageProviderName } = params.query

    delete params.query.storageProviderName

    const storageProvider = getStorageProvider(storageProviderName)

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
