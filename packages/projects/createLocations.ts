import { Paginated } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { v4 as generateUUID } from 'uuid'

import { Location } from '@xrengine/common/src/interfaces/Location'
import { Application } from '@xrengine/server-core/declarations'

function toCapitalCase(str: string) {
  return str
    .split(' ')
    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(' ')
}

export const createLocations = async (app: Application, projectName: string) => {
  return Promise.all(
    fs
      .readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects', projectName))
      .filter((file) => file.endsWith('.scene.json'))
      .map(async (sceneJson) => {
        const locationId = generateUUID()
        const settingsId = generateUUID()
        const sceneName = sceneJson.replace('.scene.json', '')
        const locationName = toCapitalCase(sceneName.replace('-', ' '))
        const locationSettings = {
          id: settingsId,
          locationId,
          locationType: 'public',
          audioEnabled: true,
          videoEnabled: true,
          faceStreamingEnabled: true,
          instanceMediaChatEnabled: true
        }
        const location = {
          id: locationId,
          name: locationName,
          slugifiedName: sceneName,
          maxUsersPerInstance: 30,
          sceneId: `${projectName}/${sceneName}`,
          location_settings: locationSettings,
          isLobby: false
        } as Location

        const existingLocation = (await app.service('location').find({
          query: {
            slugifiedName: sceneName
          }
        })) as Paginated<Location>
        if (existingLocation.total === 0) await app.service('location').create(location)
      })
  )
}
