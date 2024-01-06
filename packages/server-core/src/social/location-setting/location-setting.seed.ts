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

import {
  locationSettingPath,
  LocationSettingType
} from '@etherealengine/common/src/schemas/social/location-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { LocationID } from '@etherealengine/common/src/schemas/social/location.schema'
import { getDateTimeSql } from '../../util/datetime-sql'

export const locationSettingSeedData = [
  {
    id: '37ce32f0-208d-11eb-b02f-37cfdadfe58b',
    locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d60' as LocationID,
    locationType: 'public' as const,
    videoEnabled: true,
    audioEnabled: true,
    screenSharingEnabled: true,
    faceStreamingEnabled: true
  },
  {
    id: '37ce32f0-208d-11eb-b02f-37cfdadfe58d',
    locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d62' as LocationID,
    locationType: 'public' as const,
    videoEnabled: true,
    audioEnabled: true,
    screenSharingEnabled: true,
    faceStreamingEnabled: true
  },
  {
    id: '37ce32f0-208d-11eb-b02f-37cfdadfe58e',
    locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d63' as LocationID,
    locationType: 'public' as const,
    videoEnabled: true,
    audioEnabled: true,
    screenSharingEnabled: true,
    faceStreamingEnabled: true
  }
]

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: LocationSettingType[] = await Promise.all(
    locationSettingSeedData.map(async (item) => ({
      ...item,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210
  const trx = await knex.transaction()

  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await trx(locationSettingPath).del()

    // Inserts seed entries
    await trx(locationSettingPath).insert(seedData)
  } else {
    const existingData = await trx(locationSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await trx(locationSettingPath).insert(item)
      }
    }
  }
  await trx.raw('SET FOREIGN_KEY_CHECKS=1')

  await trx.commit()
}
