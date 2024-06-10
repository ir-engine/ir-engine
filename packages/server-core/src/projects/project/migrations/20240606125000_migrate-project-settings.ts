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

import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { ProjectDatabaseType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import {
  ProjectSettingType,
  projectSettingPath
} from '@etherealengine/common/src/schemas/setting/project-setting.schema'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'

const getConvertedProjectSettings = async (projects: ProjectDatabaseType[]) => {
  const projectSettings: ProjectSettingType[] = []

  for (const project of projects) {
    let settings: { key: string; value: string }[] = []

    if (typeof project['settings'] === 'string') {
      settings = JSON.parse(project['settings'])

      // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
      // was serialized multiple times, therefore we need to parse it twice.
      if (typeof settings === 'string') {
        settings = JSON.parse(settings)

        // There are some old records in our database that requires further parsing.
        if (typeof settings === 'string') {
          settings = JSON.parse(settings)
        }
      }
    }

    for (const setting of settings) {
      projectSettings.push({
        id: uuidv4(),
        key: setting.key,
        value: setting.value,
        type: 'private',
        projectId: project.id,
        userId: '' as UserID,
        createdAt: await getDateTimeSql(),
        updatedAt: await getDateTimeSql()
      })
    }
  }

  return projectSettings
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const settingsColumnExists = await knex.schema.hasColumn(projectPath, 'settings')

  if (settingsColumnExists === true) {
    const projects = await knex.select().from(projectPath)

    if (projects.length > 0) {
      const projectSettings = await getConvertedProjectSettings(projects.filter((item) => item.settings))

      if (projectSettings.length > 0) {
        await knex.from(projectSettingPath).insert(projectSettings)
      }
    }

    await knex.schema.alterTable(projectPath, async (table) => {
      table.dropColumn('settings')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const settingsColumnExists = await knex.schema.hasColumn(projectPath, 'settings')

  if (settingsColumnExists === false) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.json('settings').defaultTo(null)
    })
  }
}
