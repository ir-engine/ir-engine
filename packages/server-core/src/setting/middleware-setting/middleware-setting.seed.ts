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
import { v4 as uuidv4 } from 'uuid'

import {
  MiddlewareSettingDatabaseType,
  middlewareSettingPath
} from '@etherealengine/common/src/schemas/setting/middleware-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'

// Test DB Entry
export const middlewareProject = ''

// Test DB Entry
export const middlewareProjectName = ''

export const middlewareSettingTemp = JSON.stringify({
  Scene: [
    {
      component: 'MiddlewareToggle',
      label: 'Dyn Toggle 0',
      value: true,
      action: 'mwHandleToggle'
    },
    {
      component: 'MiddlewareSelect',
      label: 'Dyn Select 0',
      value: ['opt0', 'opt1', 'opt2'],
      action: 'mwHandleSelect'
    },
    {
      component: 'MiddlewareTextarea',
      label: 'Textarea Label 0',
      value: 'Default Value',
      action: 'mwHandleTextarea'
    },
    {
      component: 'MiddlewareInput',
      label: 'Dyn Label 0',
      value: 'Default Value',
      action: 'mwHandleChange'
    },
    {
      component: 'MiddlewareInput',
      label: 'Dyn Label 1',
      value: 'Default Value',
      action: 'mwHandleChange'
    },
    {
      component: 'MiddlewareInput',
      label: 'Dyn Label 2',
      value: 'Default Value',
      action: 'mwHandleChange'
    },
    {
      component: 'MiddlewareInput',
      label: 'Dyn Label 3',
      value: 'Default Value',
      action: 'mwHandleChange'
    }
  ]
})

/* Dynamic Menu Test */
// export const middlewareSettingMenu = JSON.stringify({
//   test: [
//     {
//       component: 'MiddlewareToggle',
//       label: 'Dyn Toggle 0',
//       value: true,
//       action: 'mwHandleToggle'
//     },
//     {
//       component: 'MiddlewareSelect',
//       label: 'Dyn Select 0',
//       value: ['opt0', 'opt1', 'opt2'],
//       action: 'mwHandleSelect'
//     },
//     {
//       component: 'MiddlewareTextarea',
//       label: 'Textarea Label 0',
//       value: 'Default Value',
//       action: 'mwHandleTextarea'
//     },
//     {
//       component: 'MiddlewareInput',
//       label: 'Dyn Label 0',
//       value: 'Default Value',
//       action: 'mwHandleChange'
//     },
//     {
//       component: 'MiddlewareInput',
//       label: 'Dyn Label 1',
//       value: 'Default Value',
//       action: 'mwHandleChange'
//     },
//     {
//       component: 'MiddlewareInput',
//       label: 'Dyn Label 2',
//       value: 'Default Value',
//       action: 'mwHandleChange'
//     },
//     {
//       component: 'MiddlewareInput',
//       label: 'Dyn Label 3',
//       value: 'Default Value',
//       action: 'mwHandleChange'
//     }
//   ]
// })
/* Dynamic Menu Test */

export const middlewareSettingMenu = JSON.stringify({})

export const middlewareSettingSeedData = {
  middlewareProject: middlewareProject,
  middlewareProjectName: middlewareProjectName,
  middlewareSettingTemp: middlewareSettingTemp,
  middlewareSettingMenu: middlewareSettingMenu
}

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: MiddlewareSettingDatabaseType[] = await Promise.all(
    [middlewareSettingSeedData].map(async (item) => ({
      ...item,
      id: uuidv4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(middlewareSettingPath).del()

    // Inserts seed entries
    await knex(middlewareSettingPath).insert(seedData)
  } else {
    const existingData = await knex(middlewareSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(middlewareSettingPath).insert(item)
      }
    } else {
      const existingRows = await knex(middlewareSettingPath).select<MiddlewareSettingDatabaseType[]>()
    }
  }
}
