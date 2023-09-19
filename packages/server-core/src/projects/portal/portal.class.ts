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

import { PortalType } from '@etherealengine/engine/src/schemas/projects/portal.schema'
import { sceneDataPath } from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { ServiceInterface } from '@feathersjs/feathers'
import { parseScenePortals } from '../scene/scene-parser'
import { SceneParams } from '../scene/scene.class'

export class PortalService implements ServiceInterface<PortalType, SceneParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(id: string, params?: SceneParams) {
    params = { ...params, query: { metadataOnly: false } }
    const scenes = await (await this.app.service(sceneDataPath).find(params!)).data
    const portals = scenes.map((scene) => parseScenePortals(scene)).flat() as PortalType[]
    const portalResult: PortalType = portals.find((portal) => portal.portalEntityId === id) || ({} as PortalType)
    return portalResult
  }

  async find(params?: SceneParams) {
    params = { ...params, query: { metadataOnly: false } }
    const scenes = (await this.app.service(sceneDataPath).find(params!)).data
    return scenes.map((scene) => parseScenePortals(scene)).flat() as PortalType[]
  }
}
