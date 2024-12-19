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

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const serverSettingPath = 'server-setting'

  const tableExists = await knex.schema.hasTable(serverSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(serverSettingPath).first()
    if (recordExists) {
      const serverSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Server.Port,
            value: recordExists.port || ''
          },
          {
            key: EngineSettings.Server.Hostname,
            value: recordExists.hostname || ''
          },
          {
            key: EngineSettings.Server.Mode,
            value: recordExists.mode || ''
          },
          {
            key: EngineSettings.Server.ClientHost,
            value: recordExists.clientHost || ''
          },
          {
            key: EngineSettings.Server.RootDirectory,
            value: recordExists.rootDir || ''
          },
          {
            key: EngineSettings.Server.PublicDirectory,
            value: recordExists.publicDir || ''
          },
          {
            key: EngineSettings.Server.NodeModulesDirectory,
            value: recordExists.nodeModulesDir || ''
          },
          {
            key: EngineSettings.Server.LocalStorageProvider,
            value: recordExists.localStorageProvider || ''
          },
          {
            key: EngineSettings.Server.PerformDryRun,
            value: recordExists.performDryRun || false
          },
          {
            key: EngineSettings.Server.StorageProvider,
            value: recordExists.storageProvider || ''
          },
          {
            key: EngineSettings.Server.Hub.Endpoint,
            value: JSON.parse(recordExists.hub)?.endpoint || ''
          },
          {
            key: EngineSettings.Server.Url,
            value: recordExists.url || ''
          },
          {
            key: EngineSettings.Server.CertPath,
            value: recordExists.certPath || ''
          },
          {
            key: EngineSettings.Server.KeyPath,
            value: recordExists.keyPath || ''
          },
          {
            key: EngineSettings.Server.GithubWebhookSecret,
            value: recordExists.githubWebhookSecret || ''
          },
          {
            key: EngineSettings.Server.Local,
            value: recordExists.local || false
          },
          {
            key: EngineSettings.Server.ReleaseName,
            value: recordExists.releaseName || ''
          },
          {
            key: EngineSettings.Server.InstanceserverUnreachableTimeoutSeconds,
            value: recordExists.instanceserverUnreachableTimeoutSeconds || 0
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          type: 'private' as EngineSettingType['type'],
          category: 'server',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(serverSettings)
    }
  }

  await knex.schema.dropTableIfExists(serverSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
