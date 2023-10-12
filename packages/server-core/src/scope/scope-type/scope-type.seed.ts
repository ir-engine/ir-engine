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

import { scopeTypePath, ScopeTypeType } from '@etherealengine/engine/src/schemas/scope/scope-type.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/datetime-sql'

export const scopeTypeSeed = [
  {
    type: 'admin:admin'
  },
  {
    type: 'routes:read'
  },
  {
    type: 'routes:write'
  },
  {
    type: 'location:read'
  },
  {
    type: 'location:write'
  },
  {
    type: 'static_resource:read'
  },
  {
    type: 'static_resource:write'
  },
  {
    type: 'editor:write'
  },
  {
    type: 'bot:read'
  },
  {
    type: 'bot:write'
  },
  {
    type: 'globalAvatars:read'
  },
  {
    type: 'globalAvatars:write'
  },
  {
    type: 'benchmarking:read'
  },
  {
    type: 'benchmarking:write'
  },
  {
    type: 'instance:read'
  },
  {
    type: 'instance:write'
  },
  {
    type: 'invite:read'
  },
  {
    type: 'channel:read'
  },
  {
    type: 'channel:write'
  },
  {
    type: 'user:read'
  },
  {
    type: 'user:write'
  },
  {
    type: 'scene:read'
  },
  {
    type: 'scene:write'
  },
  {
    type: 'projects:read'
  },
  {
    type: 'projects:write'
  },
  {
    type: 'settings:read'
  },
  {
    type: 'settings:write'
  },
  {
    type: 'server:read'
  },
  {
    type: 'server:write'
  },
  {
    type: 'recording:read'
  },
  {
    type: 'recording:write'
  }
]

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ScopeTypeType[] = await Promise.all(
    scopeTypeSeed.map(async (item) => ({
      ...item,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(scopeTypePath).del()

    // Inserts seed entries
    await knex(scopeTypePath).insert(seedData)
  } else {
    const existingData = await knex(scopeTypePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(scopeTypePath).insert(item)
      }
    }
  }
}
