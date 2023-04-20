// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  EmailAuthType,
  EmailSettingDatabaseType,
  EmailSettingQuery,
  EmailSettingType,
  EmailSmtpType,
  EmailSubjectType
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const emailSettingResolver = resolve<EmailSettingType, HookContext>({})

export const emailDbToSchema = async (rawData: EmailSettingDatabaseType): Promise<EmailSettingType> => {
  let smtp = JSON.parse(rawData.smtp) as EmailSmtpType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof smtp === 'string') {
    smtp = JSON.parse(smtp)

    // We need to deserialized nested objects of pre-feathers 5 data.
    if (typeof smtp.auth === 'string') {
      smtp.auth = JSON.parse(smtp.auth) as EmailAuthType
    }
  }

  let subject = JSON.parse(rawData.subject) as EmailSubjectType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof subject === 'string') {
    subject = JSON.parse(subject)
  }

  return {
    ...rawData,
    smtp,
    subject
  }
}

export const emailSettingExternalResolver = resolve<EmailSettingType, HookContext>(
  {},
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return emailDbToSchema(rawData)
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
        ...rawData,
        smtp: JSON.stringify(rawData.smtp),
        subject: JSON.stringify(rawData.subject)
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
        ...rawData,
        smtp: JSON.stringify(rawData.smtp),
        subject: JSON.stringify(rawData.subject)
      }
    }
  }
)

export const emailSettingQueryResolver = resolve<EmailSettingQuery, HookContext>({})
