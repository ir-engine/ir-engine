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

import {
  LocationData,
  LocationID,
  locationPath,
  LocationSettingType,
  LocationType
} from '@etherealengine/common/src/schema.type.module'
import { assetPath } from '@etherealengine/common/src/schemas/assets/asset.schema'
import { toCapitalCase } from '@etherealengine/common/src/utils/miscUtils'
import { Application } from '@etherealengine/server-core/declarations'
import { Paginated } from '@feathersjs/feathers/lib'

export const createLocations = async (app: Application, projectName: string, sceneFiles: string[] = []) => {
  return Promise.all(
    sceneFiles.map(async (fileName) => {
      const assetURL = `projects/${projectName}/${fileName}`
      const locationId = crypto.randomUUID() as LocationID
      const sceneId = crypto.randomUUID()
      const settingsId = crypto.randomUUID()
      const sceneName = fileName.split('/').pop()!.replace('.scene.json', '').replace('.gltf', '')

      /** @todo use .gltf instead */
      const scene = await app.service(assetPath).create(
        {
          id: sceneId,
          assetURL,
          thumbnailURL: assetURL.replace('.scene.json', '.thumbnail.jpg').replace('.gltf', '.thumbnail.jpg'),
          project: projectName
        },
        { isInternal: true }
      )

      const locationName = toCapitalCase(sceneName.replace('-', ' '))
      const locationSetting = {
        id: settingsId,
        locationId,
        locationType: 'public',
        audioEnabled: true,
        videoEnabled: true,
        screenSharingEnabled: true,
        faceStreamingEnabled: true
      } as LocationSettingType
      const location = {
        id: locationId,
        name: locationName,
        slugifiedName: sceneName,
        maxUsersPerInstance: 20,
        sceneId: scene.id,
        locationSetting,
        isLobby: false,
        isFeatured: false
      } as LocationData

      const existingLocation = (await app.service(locationPath).find({
        query: {
          slugifiedName: sceneName
        }
      })) as Paginated<LocationType>
      if (existingLocation.total === 0) await app.service(locationPath).create(location)
    })
  )
}
