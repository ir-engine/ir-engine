// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  AwsCloudFrontType,
  AwsKeysType,
  AwsRoute53Type,
  AwsS3Type,
  AwsSettingDatabaseType,
  AwsSettingQuery,
  AwsSettingType,
  AwsSmsType
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const awsSettingResolver = resolve<AwsSettingType, HookContext>({})

export const awsDbToSchema = async (rawData: AwsSettingDatabaseType): Promise<AwsSettingType> => {
  let keys = JSON.parse(rawData.keys) as AwsKeysType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof keys === 'string') {
    keys = JSON.parse(keys)
  }

  let route53 = JSON.parse(rawData.route53) as AwsRoute53Type

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof route53 === 'string') {
    route53 = JSON.parse(route53)

    // We need to deserialized nested objects of pre-feathers 5 data.
    if (typeof route53.keys === 'string') {
      route53.keys = JSON.parse(route53.keys) as AwsKeysType
    }
  }

  let s3 = JSON.parse(rawData.s3) as AwsS3Type

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof s3 === 'string') {
    s3 = JSON.parse(s3)
  }

  let cloudfront = JSON.parse(rawData.cloudfront) as AwsCloudFrontType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof cloudfront === 'string') {
    cloudfront = JSON.parse(cloudfront)
  }

  let sms = JSON.parse(rawData.sms) as AwsSmsType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof sms === 'string') {
    sms = JSON.parse(sms)
  }

  return {
    ...rawData,
    keys,
    route53,
    s3,
    cloudfront,
    sms
  }
}

export const awsSettingExternalResolver = resolve<AwsSettingType, HookContext>(
  {},
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return awsDbToSchema(rawData)
    }
  }
)

export const awsSettingDataResolver = resolve<AwsSettingDatabaseType, HookContext>(
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
        keys: JSON.stringify(rawData.keys),
        route53: JSON.stringify(rawData.route53),
        s3: JSON.stringify(rawData.s3),
        cloudfront: JSON.stringify(rawData.cloudfront),
        sms: JSON.stringify(rawData.sms)
      }
    }
  }
)

export const awsSettingPatchResolver = resolve<AwsSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        keys: JSON.stringify(rawData.keys),
        route53: JSON.stringify(rawData.route53),
        s3: JSON.stringify(rawData.s3),
        cloudfront: JSON.stringify(rawData.cloudfront),
        sms: JSON.stringify(rawData.sms)
      }
    }
  }
)

export const awsSettingQueryResolver = resolve<AwsSettingQuery, HookContext>({})
