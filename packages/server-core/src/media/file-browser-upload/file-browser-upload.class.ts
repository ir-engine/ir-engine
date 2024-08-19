/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'

import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'

import { Application } from '../../../declarations'

export interface FileBrowserUploadParams extends KnexAdapterParams {
  files: UploadFile[]
}

/**
 * A class for File Browser Upload service
 */
export class FileBrowserUploadService implements ServiceInterface<string[], any, FileBrowserUploadParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(rawData: { args: string }, params: FileBrowserUploadParams) {
    const data = typeof rawData.args === 'string' ? JSON.parse(rawData.args) : rawData.args
    const result = (
      await Promise.all(
        params.files.map((file, i) => {
          const args = data[i]
          return this.app.service(fileBrowserPath).patch(null, {
            ...args,
            project: args.project,
            path: args.path,
            body: file.buffer as Buffer,
            contentType: args.contentType || file.mimetype
          })
        })
      )
    ).map((result) => result.url)

    // Clear params otherwise all the files and auth details send back to client as  response
    for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

    return result
  }
}
