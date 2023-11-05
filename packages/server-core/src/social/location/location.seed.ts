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

import { Knex } from 'knex'

import { LocationDatabaseType, locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { SceneData, SceneID, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { getDateTimeSql } from '../../util/datetime-sql'

export const sceneSeedData = [
  {
    id: 'b9427eb1-62f5-4bed-b3ff-eccb5fd116e4' as SceneID,
    name: 'default',
    scenePath: 'scenes/default/default.scene.json',
    thumbnailPath: 'scenes/default/default.thumbnail.ktx2',
    envMapPath: 'scenes/default/default.envmap.ktx2'
  },
  {
    id: 'b9427eb1-62f5-4bed-b3ff-eccb5fd116e6' as SceneID,
    name: 'sky-station',
    scenePath: 'scenes/sky-station/sky-station.scene.json',
    thumbnailPath: 'scenes/sky-station/sky-station.thumbnail.ktx2',
    envMapPath: 'scenes/sky-station/sky-station.envmap.ktx2'
  },
  {
    id: 'b9427eb1-62f5-4bed-b3ff-eccb5fd116e8' as SceneID,
    name: 'apartment',
    scenePath: 'scenes/apartment/apartment.scene.json',
    thumbnailPath: 'scenes/apartment/apartment.thumbnail.ktx2',
    envMapPath: 'scenes/apartment/apartment.envmap.ktx2'
  }
]

export const locationSeedData = [
  {
    id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d60',
    name: 'Default',
    slugifiedName: 'default',
    maxUsersPerInstance: 30,
    sceneId: 'b9427eb1-62f5-4bed-b3ff-eccb5fd116e4' as SceneID,
    isFeatured: false,
    isLobby: false
  },
  {
    id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d62',
    name: 'Sky Station',
    slugifiedName: 'sky-station',
    maxUsersPerInstance: 30,
    sceneId: 'b9427eb1-62f5-4bed-b3ff-eccb5fd116e6' as SceneID,
    isFeatured: false,
    isLobby: false
  },
  {
    id: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d63',
    name: 'Apartment',
    slugifiedName: 'apartment',
    maxUsersPerInstance: 30,
    sceneId: 'b9427eb1-62f5-4bed-b3ff-eccb5fd116e8' as SceneID,
    isFeatured: false,
    isLobby: false
  }
]

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const sceneData: SceneData[] = await Promise.all(
    sceneSeedData.map(async (item) => ({
      ...item,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  const seedData: LocationDatabaseType[] = await Promise.all(
    locationSeedData.map(async (item) => ({
      ...item,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(scenePath).del()
    await knex(locationPath).del()

    // Inserts seed entries
    await knex(scenePath).insert(sceneData)
    await knex(locationPath).insert(seedData)
  } else {
    const existingSceneData = await knex(scenePath).count({ count: '*' })
    const existingData = await knex(locationPath).count({ count: '*' })

    if (existingSceneData.length === 0 || existingSceneData[0].count === 0) {
      for (const item of sceneData) {
        await knex(scenePath).insert(item)
      }
    }

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(locationPath).insert(item)
      }
    }
  }
}
