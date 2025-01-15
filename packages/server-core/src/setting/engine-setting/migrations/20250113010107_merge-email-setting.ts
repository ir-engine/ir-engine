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
  const emailSettingPath = 'email-setting'

  const tableExists = await knex.schema.hasTable(emailSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(emailSettingPath).first()

    if (recordExists) {
      const emailSmtpSettings = recordExists.smtp || {}
      const emailSmtpConfigArray = flattenObjectToArray({ smtp: JSON.parse(emailSmtpSettings) })

      const emailSubjectSetting = recordExists.subject || {}
      const emailSubjectConfigArray = flattenObjectToArray({ subject: JSON.parse(emailSubjectSetting) })

      const instanceServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.EmailSetting.From,
            value: recordExists.from || `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>` || ''
          },
          {
            key: EngineSettings.EmailSetting.Smtp.Host,
            value:
              emailSmtpConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Smtp.Host)?.value || 'test'
          },
          {
            key: EngineSettings.EmailSetting.Smtp.Port,
            value: emailSmtpConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Smtp.Port)?.value || ''
          },
          {
            key: EngineSettings.EmailSetting.Smtp.Secure,
            value:
              `${emailSmtpConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Smtp.Secure)?.value}` ||
              'true'
          },
          {
            key: EngineSettings.EmailSetting.Smtp.Auth.User,
            value:
              emailSmtpConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Smtp.Auth.User)?.value ||
              'test'
          },
          {
            key: EngineSettings.EmailSetting.Smtp.Auth.Pass,
            value:
              emailSmtpConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Smtp.Auth.Pass)?.value ||
              'test'
          },
          {
            key: EngineSettings.EmailSetting.SmsNameCharacterLimit,
            value: recordExists.smsNameCharacterLimit || process.env.SMS_NAME_CHARACTER_LIMIT || '20'
          },
          {
            key: EngineSettings.EmailSetting.Subject.NewUser,
            value:
              emailSubjectConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Subject.NewUser)?.value ||
              process.env.SMTP_SUBJECT_NEW_USER ||
              'Infinite Reality Engine signup'
          },
          {
            key: EngineSettings.EmailSetting.Subject.Channel,
            value:
              emailSubjectConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Subject.Channel)?.value ||
              process.env.SMTP_SUBJECT_CHANNEL ||
              'Infinite Reality Engine channel invitation'
          },
          {
            key: EngineSettings.EmailSetting.Subject.Friend,
            value:
              emailSubjectConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Subject.Friend)?.value ||
              process.env.SMTP_SUBJECT_FRIEND ||
              'Infinite Reality Engine friend request'
          },
          {
            key: EngineSettings.EmailSetting.Subject.Instance,
            value:
              emailSubjectConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Subject.Instance)
                ?.value ||
              process.env.SMTP_SUBJECT_INSTANCE ||
              'Infinite Reality Engine location link'
          },
          {
            key: EngineSettings.EmailSetting.Subject.Location,
            value:
              emailSubjectConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Subject.Location)
                ?.value ||
              process.env.SMTP_SUBJECT_LOCATION ||
              'Infinite Reality Engine location link'
          },
          {
            key: EngineSettings.EmailSetting.Subject.Login,
            value:
              emailSubjectConfigArray.find((item) => item.key === EngineSettings.EmailSetting.Subject.Login)?.value ||
              process.env.SMTP_SUBJECT_LOGIN ||
              'Infinite Reality Engine login link'
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(`${item.value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'email',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...instanceServerSettings])
    }
  }

  await knex.schema.dropTableIfExists(emailSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
