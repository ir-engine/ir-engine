import { Knex } from 'knex'
import { v4 } from 'uuid'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

const TABLE_NAME = 'coilSetting'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        paymentPointer: process.env.COIL_PAYMENT_POINTER || null,
        clientId: process.env.COIL_API_CLIENT_ID || null,
        clientSecret: process.env.COIL_API_CLIENT_SECRET || null
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
        .where('paymentPointer', item.paymentPointer)
        .andWhere('clientId', item.clientId)
        .andWhere('clientSecret', item.clientSecret)
      if (existingData.length === 0) {
        await knex(TABLE_NAME).insert(item)
      }
    }
  }
}
