// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  ClientSettingDatabaseType,
  ClientSettingQuery,
  ClientSettingType,
  ClientSocialLinkType,
  ClientThemeOptionsType
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const clientSettingResolver = resolve<ClientSettingType, HookContext>({})

export const clientDbToSchema = async (rawData: ClientSettingDatabaseType): Promise<ClientSettingType> => {
  let appSocialLinks = JSON.parse(rawData.appSocialLinks) as ClientSocialLinkType[]

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof appSocialLinks === 'string') {
    appSocialLinks = JSON.parse(appSocialLinks)
  }

  let themeSettings = JSON.parse(rawData.themeSettings) as Record<string, ClientThemeOptionsType>

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof themeSettings === 'string') {
    themeSettings = JSON.parse(themeSettings)
  }

  return {
    ...rawData,
    appSocialLinks,
    themeSettings
  }
}

export const clientSettingExternalResolver = resolve<ClientSettingType, HookContext>(
  {},
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return clientDbToSchema(rawData)
    }
  }
)

export const clientSettingDataResolver = resolve<ClientSettingDatabaseType, HookContext>(
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
        appSocialLinks: JSON.stringify(rawData.appSocialLinks),
        themeSettings: JSON.stringify(rawData.themeSettings)
      }
    }
  }
)

export const clientSettingPatchResolver = resolve<ClientSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        appSocialLinks: JSON.stringify(rawData.appSocialLinks),
        themeSettings: JSON.stringify(rawData.themeSettings)
      }
    }
  }
)

export const clientSettingQueryResolver = resolve<ClientSettingQuery, HookContext>({})
