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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ServerHubType,
  ServerSettingDatabaseType,
  ServerSettingQuery,
  ServerSettingType
} from '@ir-engine/common/src/schemas/setting/server-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const serverDbToSchema = (rawData: ServerSettingDatabaseType): ServerSettingType => {
  let hub = JSON.parse(rawData.hub) as ServerHubType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof hub === 'string') {
    hub = JSON.parse(hub)
  }

  return {
    ...rawData,
    hub
  }
}

export const serverSettingResolver = resolve<ServerSettingType, HookContext>(
  {
    createdAt: virtual(async (serverSetting) => fromDateTimeSql(serverSetting.createdAt)),
    updatedAt: virtual(async (serverSetting) => fromDateTimeSql(serverSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return serverDbToSchema(rawData)
    }
  }
)

export const serverSettingExternalResolver = resolve<ServerSettingType, HookContext>({})

export const serverSettingDataResolver = resolve<ServerSettingDatabaseType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        hub: JSON.stringify(rawData.hub)
      }
    }
  }
)

export const serverSettingPatchResolver = resolve<ServerSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        hub: JSON.stringify(rawData.hub)
      }
    }
  }
)

export const serverSettingQueryResolver = resolve<ServerSettingQuery, HookContext>({})
