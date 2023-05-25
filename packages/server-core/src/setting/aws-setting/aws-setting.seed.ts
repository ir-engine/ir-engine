import { Knex } from 'knex'
import { v4 } from 'uuid'

import { awsSettingPath } from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        keys: JSON.stringify({
          accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET
        }),
        route53: JSON.stringify({
          hostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID,
          keys: {
            accessKeyId: process.env.ROUTE53_ACCESS_KEY_ID,
            secretAccessKey: process.env.ROUTE53_ACCESS_KEY_SECRET
          }
        }),
        s3: JSON.stringify({
          endpoint: process.env.STORAGE_S3_ENDPOINT,
          staticResourceBucket: process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET,
          region: process.env.STORAGE_S3_REGION,
          avatarDir: process.env.STORAGE_S3_AVATAR_DIRECTORY,
          s3DevMode: process.env.STORAGE_S3_DEV_MODE
        }),
        cloudfront: JSON.stringify({
          domain: process.env.STORAGE_CLOUDFRONT_DOMAIN,
          distributionId: process.env.STORAGE_CLOUDFRONT_DISTRIBUTION_ID,
          region: process.env.STORAGE_CLOUDFRONT_REGION || process.env.STORAGE_S3_REGION
        }),
        sms: JSON.stringify({
          accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID,
          applicationId: process.env.AWS_SMS_APPLICATION_ID,
          region: process.env.AWS_SMS_REGION,
          senderId: process.env.AWS_SMS_SENDER_ID,
          secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY
        })
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(awsSettingPath).del()

    // Inserts seed entries
    await knex(awsSettingPath).insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex(awsSettingPath)
        .where('keys', item.keys)
        .andWhere('route53', item.route53)
        .andWhere('s3', item.s3)
        .andWhere('cloudfront', item.cloudfront)
        .andWhere('sms', item.sms)
      if (existingData.length === 0) {
        await knex(awsSettingPath).insert(item)
      }
    }
  }
}
