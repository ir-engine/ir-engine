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

import { Application } from '../../../declarations'

import {
  SceneCreateData,
  SceneDataType,
  sceneDataPath
} from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { ServiceInterface } from '@feathersjs/feathers'
import { UploadParams } from '../../media/upload-asset/upload-asset.service'

export class SceneUploadService implements ServiceInterface<SceneDataType, SceneCreateData, UploadParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: SceneCreateData, params: UploadParams) {
    //if (typeof data === 'string') data = JSON.parse(data)
    //if (typeof data.sceneData === 'string') data.sceneData = JSON.parse(data.sceneData)

    const thumbnailBuffer = params.files.length > 0 ? (params?.files[0].buffer as Buffer) : undefined

    const { name, sceneData, storageProvider, projectName } = data

    const result = (await this.app
      .service(sceneDataPath)
      .update(null, { name, sceneData, storageProvider, thumbnailBuffer, projectName })) as SceneDataType

    // Clear params otherwise all the files and auth details send back to client as response
    for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

    return result
  }
}
