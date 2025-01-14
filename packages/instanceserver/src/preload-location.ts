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

// import { WorldScene } from '@ir-engine/engine/src/scene/systems/SceneLoadingSystem'
// import { Application } from '@ir-engine/server-core/declarations'
// import config from '@ir-engine/server-core/src/appconfig'
// import getLocalServerIp from '@ir-engine/server-core/src/util/get-local-server-ip'

// TODO: fix this file - currently unused (but nice to have)

export {}
/*
export default async function (locationName, app: Application) {
  await app.isSetup
  let service, serviceId
  const locationResult = await app.service(locationPath).find({
    query: {
      slugifiedName: locationName
    }
  })
  if (locationResult.total === 0) return
  const location = locationResult.data[0]
  const scene = await app.get('sequelizeClient').models.collection.findOne({
    query: {
      sid: location.sceneId
    }
  })
  if (scene == null) return
  const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/
  const projectResult = await app.service(scenePath).get(scene.sid, null!)
  const projectUrl = projectResult.scene_url
  const regexResult = projectUrl.match(projectRegex)
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }
  const result = await app.service(service).get(serviceId)

  let entitiesLeft = -1
  let lastEntitiesLeft = -1
  const loadingInterval = setInterval(() => {
    if (entitiesLeft >= 0 && lastEntitiesLeft !== entitiesLeft) {
      lastEntitiesLeft = entitiesLeft
      console.log(entitiesLeft + ' entites left...')
    }
  }, 1000)

  await updateSceneFromJSON(result, (left) => {
    entitiesLeft = left
  })

  clearInterval(loadingInterval)
  const agonesSDK = app.agonesSDK
  const isResult = await agonesSDK.getGameServer()
  const { status } = isResult
  const localIp = await getLocalServerIp()
  const selfIpAddress = `${status.address as string}:${status.portsList[0].port as string}`
  const newInstance = {
    sceneId: location.sid,
    ipAddress: config.kubernetes.enabled ? selfIpAddress : `${localIp.ipAddress}:3031`,
    locationId: location.id
  } as any
  app.isMediaInstance = false
  const instanceResult = await app.service(instancePath).create(newInstance)
  app.instance = instanceResult

  console.log('Pre-loaded location', location.id)
}
*/
