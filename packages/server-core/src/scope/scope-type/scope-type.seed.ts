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

import { scopeTypePath, ScopeTypeType } from '@etherealengine/common/src/schemas/scope/scope-type.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { ScopeType } from '@etherealengine/common/src/schemas/scope/scope.schema'
import { clientSettingPath } from '@etherealengine/common/src/schemas/setting/client-setting.schema'
import { getDateTimeSql } from '../../util/datetime-sql'

export const scopeTypeSeed = [
  {
    type: 'admin:admin' as ScopeType
  },
  {
    type: 'routes:read' as ScopeType
  },
  {
    type: 'routes:write' as ScopeType
  },
  {
    type: 'location:read' as ScopeType
  },
  {
    type: 'location:write' as ScopeType
  },
  {
    type: 'static_resource:read' as ScopeType
  },
  {
    type: 'static_resource:write' as ScopeType
  },
  {
    type: 'editor:write' as ScopeType
  },
  {
    type: 'bot:read' as ScopeType
  },
  {
    type: 'bot:write' as ScopeType
  },
  {
    type: 'globalAvatars:read' as ScopeType
  },
  {
    type: 'globalAvatars:write' as ScopeType
  },
  {
    type: 'benchmarking:read' as ScopeType
  },
  {
    type: 'benchmarking:write' as ScopeType
  },
  {
    type: 'instance:read' as ScopeType
  },
  {
    type: 'instance:write' as ScopeType
  },
  {
    type: 'invite:read' as ScopeType
  },
  {
    type: 'invite:write' as ScopeType
  },
  {
    type: 'channel:read' as ScopeType
  },
  {
    type: 'channel:write' as ScopeType
  },
  {
    type: 'user:read' as ScopeType
  },
  {
    type: 'user:write' as ScopeType
  },
  {
    type: 'scene:read' as ScopeType
  },
  {
    type: 'scene:write' as ScopeType
  },
  {
    type: 'projects:read' as ScopeType
  },
  {
    type: 'projects:write' as ScopeType
  },
  {
    type: 'settings:read' as ScopeType
  },
  {
    type: 'settings:write' as ScopeType
  },
  {
    type: `${clientSettingPath}:read` as ScopeType
  },
  {
    type: `${clientSettingPath}:write` as ScopeType
  },
  {
    type: 'server:read' as ScopeType
  },
  {
    type: 'server:write' as ScopeType
  },
  {
    type: 'recording:read' as ScopeType
  },
  {
    type: 'recording:write' as ScopeType
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
