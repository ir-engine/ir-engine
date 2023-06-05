// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  ServerHubType,
  ServerSettingDatabaseType,
  ServerSettingQuery,
  ServerSettingType
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const serverSettingResolver = resolve<ServerSettingType, HookContext>({})

export const serverDbToSchema = async (rawData: ServerSettingDatabaseType): Promise<ServerSettingType> => {
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

export const serverSettingExternalResolver = resolve<ServerSettingType, HookContext>(
  {},
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return serverDbToSchema(rawData)
    }
  }
)

export const serverSettingDataResolver = resolve<ServerSettingDatabaseType, HookContext>(
  {
    id: async () => {
      return v4()
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
