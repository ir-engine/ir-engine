import { Knex } from 'knex'
import { v4 } from 'uuid'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

const TABLE_NAME = 'emailSetting'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        smtp: JSON.stringify({
          host: process.env.SMTP_HOST || 'test',
          port: parseInt(process.env.SMTP_PORT!) || 'test',
          secure: process.env.SMTP_SECURE === 'true' || true,
          auth: JSON.stringify({
            user: process.env.SMTP_USER || 'test',
            pass: process.env.SMTP_PASS || 'test'
          })
        }),
        // Name and email of default sender (for login emails, etc)
        from: `${process.env.SMTP_FROM_NAME}` + ` <${process.env.SMTP_FROM_EMAIL}>` || 'test',
        subject: JSON.stringify({
          // Subject of the Login Link email
          'new-user': 'Ethereal Engine signup',
          location: 'Ethereal Engine location link',
          instance: 'Ethereal Engine location link',
          login: 'Ethereal Engine login link',
          friend: 'Ethereal Engine friend request',
          group: 'Ethereal Engine group invitation',
          party: 'Ethereal Engine party invitation'
        }),
        smsNameCharacterLimit: 20
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(TABLE_NAME).del()

    // Inserts seed entries
    await knex(TABLE_NAME).insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex(TABLE_NAME)
        .where('smtp', item.smtp)
        .andWhere('from', item.from)
        .andWhere('subject', item.subject)
      if (existingData.length === 0) {
        await knex(TABLE_NAME).insert(item)
      }
    }
  }
}
