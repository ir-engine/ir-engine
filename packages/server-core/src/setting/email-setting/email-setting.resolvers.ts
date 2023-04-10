// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  EmailSettingDatabaseType,
  EmailSettingQuery,
  EmailSettingType,
  EmailSmtpType,
  EmailSubjectType
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const emailSettingResolver = resolve<EmailSettingType, HookContext>({})

export const emailSettingExternalResolver = resolve<EmailSettingType, HookContext>(
  {},
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData.data,
        smtp: JSON.parse(rawData.data.smtp) as EmailSmtpType,
        subject: JSON.parse(rawData.data.subject) as EmailSubjectType
      }
    }
  }
)

export const emailSettingDataResolver = resolve<EmailSettingDatabaseType, HookContext>(
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
        ...rawData.data,
        smtp: JSON.stringify(rawData.data.smtp),
        subject: JSON.stringify(rawData.data.subject)
      }
    }
  }
)

export const emailSettingPatchResolver = resolve<EmailSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData.data,
        smtp: JSON.stringify(rawData.data.smtp),
        subject: JSON.stringify(rawData.data.subject)
      }
    }
  }
)

export const emailSettingQueryResolver = resolve<EmailSettingQuery, HookContext>({})
