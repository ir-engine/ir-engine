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
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { flattenObjectToArray } from '@ir-engine/common/src/utils/jsonHelperUtils'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const awsSettingPath = 'aws-setting'

  const tableExists = await knex.schema.hasTable(awsSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(awsSettingPath).first()
    console.log('recordExists', recordExists)

    if (recordExists) {
      const awsS3Settings = recordExists.s3 || {}
      const cloudfrontSettings = recordExists.cloudfront || {}
      const smsSettings = recordExists.sms || {}
      const eksSettings = recordExists.eks || {}

      const awsS3SettingConfigArray = flattenObjectToArray({ s3: JSON.parse(awsS3Settings) })
      const cloudfrontAwsConfigArray = flattenObjectToArray({ cloudfront: JSON.parse(cloudfrontSettings) })
      const smsAwsConfigArray = flattenObjectToArray({ sms: JSON.parse(smsSettings) })
      const eksAwsConfigArray = flattenObjectToArray({ eks: JSON.parse(eksSettings) })

      console.log('awsS3SettingConfigArray', awsS3SettingConfigArray)
      console.log('cloudfrontAwsConfigArray', cloudfrontAwsConfigArray)
      console.log('smsAwsConfigArray', smsAwsConfigArray)
      console.log('eksAwsConfigArray', eksAwsConfigArray)

      const awsSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Aws.S3.AccessKeyId,
            value: awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.AccessKeyId)?.value || ''
          },
          {
            key: EngineSettings.Aws.S3.AvatarDir,
            value: awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.AvatarDir)?.value || ''
          },
          {
            key: EngineSettings.Aws.S3.Endpoint,
            value: awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.Endpoint)?.value || ''
          },
          {
            key: EngineSettings.Aws.S3.Region,
            value: awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.Region)?.value || ''
          },
          {
            key: EngineSettings.Aws.S3.SecretAccessKey,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.SecretAccessKey)?.value || ''
          },
          {
            key: EngineSettings.Aws.S3.S3DevMode,
            value: awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.S3DevMode)?.value || ''
          },
          {
            key: EngineSettings.Aws.S3.StaticResourceBucket,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.StaticResourceBucket)?.value ||
              ''
          },
          {
            key: EngineSettings.Aws.CloudFront.DistributionId,
            value:
              cloudfrontAwsConfigArray.find((item) => item.key === EngineSettings.Aws.CloudFront.DistributionId)
                ?.value || ''
          },
          {
            key: EngineSettings.Aws.CloudFront.Domain,
            value:
              cloudfrontAwsConfigArray.find((item) => item.key === EngineSettings.Aws.CloudFront.Domain)?.value || ''
          },
          {
            key: EngineSettings.Aws.CloudFront.Region,
            value:
              cloudfrontAwsConfigArray.find((item) => item.key === EngineSettings.Aws.CloudFront.Region)?.value || ''
          },
          {
            key: EngineSettings.Aws.SMS.AccessKeyId,
            value: smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.AccessKeyId)?.value || ''
          },
          {
            key: EngineSettings.Aws.SMS.SecretAccessKey,
            value: smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.SecretAccessKey)?.value || ''
          },
          {
            key: EngineSettings.Aws.SMS.ApplicationId,
            value: smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.ApplicationId)?.value || ''
          },
          {
            key: EngineSettings.Aws.SMS.Region,
            value: smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.Region)?.value || ''
          },
          {
            key: EngineSettings.Aws.SMS.SenderId,
            value: smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.SenderId)?.value || ''
          },
          {
            key: EngineSettings.Aws.EKS.AccessKeyId,
            value: eksAwsConfigArray.find((item) => item.key === EngineSettings.Aws.EKS.AccessKeyId)?.value || ''
          },
          {
            key: EngineSettings.Aws.EKS.RoleArn,
            value: eksAwsConfigArray.find((item) => item.key === EngineSettings.Aws.EKS.RoleArn)?.value || ''
          },
          {
            key: EngineSettings.Aws.EKS.SecretAccessKey,
            value: eksAwsConfigArray.find((item) => item.key === EngineSettings.Aws.EKS.SecretAccessKey)?.value || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(`${item.value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'aws',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...awsSettings])
    }
  }

  // await knex.schema.dropTableIfExists(awsSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
