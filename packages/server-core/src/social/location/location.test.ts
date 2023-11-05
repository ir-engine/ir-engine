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

import assert from 'assert'
import { v1 } from 'uuid'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { locationSettingPath } from '@etherealengine/engine/src/schemas/social/location-setting.schema'
import { LocationID, LocationType, locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'

import { SceneID, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { toDateTimeSql } from '../../util/datetime-sql'
import { LocationParams } from './location.class'

const params = { isInternal: true } as LocationParams

describe('location.test', () => {
  let app: Application
  const locations: any[] = []
  let testScene

  before(async () => {
    app = createFeathersKoaApp()
    testScene = await app.service(scenePath).create({
      id: `test-scene-${v1()}` as SceneID,
      name: 'Test Scene',
      scenePath: '',
      thumbnailPath: '',
      envMapPath: '',
      createdAt: toDateTimeSql(new Date()),
      updatedAt: toDateTimeSql(new Date())
    })
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  it('should create a new location', async () => {
    const name = `Test Location ${v1()}`
    const sceneId = testScene.id

    const item = await app.service(locationPath).create(
      {
        name,
        slugifiedName: '',
        sceneId,
        maxUsersPerInstance: 30,
        locationSetting: {
          id: '',
          locationType: 'public',
          audioEnabled: true,
          videoEnabled: true,
          faceStreamingEnabled: false,
          screenSharingEnabled: false,
          locationId: '' as LocationID,
          createdAt: '',
          updatedAt: ''
        },
        isLobby: false,
        isFeatured: false
      },
      params
    )

    assert.ok(item)
    assert.equal(item.name, name)
    locations.push(item)
  })

  it('should get the new location', async () => {
    const item = await app.service(locationPath).get(locations[0].id)

    assert.ok(item)
    assert.equal(item.name, locations[0].name)
    assert.equal(item.slugifiedName, locations[0].slugifiedName)
    assert.equal(item.isLobby, locations[0].isLobby)
  })

  it('should be able to update the location', async () => {
    const newName = `Update Test Location ${v1()}`
    const locationSetting = await app.service(locationSettingPath).create({
      locationType: 'public',
      audioEnabled: true,
      videoEnabled: true,
      faceStreamingEnabled: false,
      screenSharingEnabled: false,
      locationId: locations[0].id
    })

    const locationData = JSON.parse(JSON.stringify(locations[0]))
    delete locationData.locationBans
    delete locationData.locationAuthorizedUsers
    delete locationData.locationAdmin
    delete locationData.createdAt
    delete locationData.updatedAt

    const item = (await app
      .service(locationPath)
      .patch(locations[0].id, { ...locationData, name: newName, locationSetting })) as any as LocationType

    assert.ok(item)
    assert.equal(item.name, newName)

    locations[0].name = newName
  })

  it('should not be able to make lobby if not admin', () => {
    assert.rejects(() => app.service(locationPath).patch(locations[0].id, { isLobby: true }))
  })

  it('should be able to delete the location', async () => {
    await app.service(locationPath).remove(locations[0].id)

    const item = await app.service(locationPath).find({ query: { id: locations[0].id } })

    assert.equal(item.total, 0)
  })
})
