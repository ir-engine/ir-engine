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

import { KnexAdapterParams } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import extract from 'extract-zip'
import fs from 'fs'
import path from 'path'

import { assetLibraryMethods, assetLibraryPath } from '@ir-engine/common/src/schemas/assets/asset-library.schema'

import { Application } from '../../../declarations'
import assetLibraryDocs from './zipper.docs'
import hooks from './zipper.hooks'

const rootPath = path.join(appRootPath.path, 'packages/projects/projects/')

export interface AssetLibraryParams extends KnexAdapterParams {
  path: string
}

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [assetLibraryPath]: {
      create: (createParams: AssetLibraryParams) => Promise<string>
    }
  }
}

export default (app: Application): void => {
  app.use(
    assetLibraryPath,
    {
      create: async (createParams: AssetLibraryParams) => {
        try {
          const inPath = decodeURI(createParams.path)
          const pathData = /.*projects\/([\w\d\s\-_]+)\/assets\/([\w\d\s\-_\\\/]+).zip$/.exec(inPath)
          if (!pathData) throw new Error('could not extract path data')
          const [_, projectName, fileName] = pathData
          const assetRoot = `${projectName}/assets/${fileName}`
          const fullPath = path.join(rootPath, assetRoot)
          fs.mkdirSync(fullPath)
          await extract(`${fullPath}.zip`, { dir: fullPath })
          return assetRoot
        } catch (e) {
          throw new Error('error unzipping archive:', e)
        }
      }
    },
    {
      // A list of all methods this service exposes externally
      methods: assetLibraryMethods,
      // You can add additional custom events to be sent to clients here
      events: [],
      docs: assetLibraryDocs
    }
  )

  const service = app.service(assetLibraryPath)
  service.hooks(hooks)
}
