import { Knex } from 'knex'
import { v4 } from 'uuid'

import { coilSettingPath } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

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
    await knex(coilSettingPath).del()

    // Inserts seed entries
    await knex(coilSettingPath).insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex(coilSettingPath)
        .where('paymentPointer', item.paymentPointer)
        .andWhere('clientId', item.clientId)
        .andWhere('clientSecret', item.clientSecret)
      if (existingData.length === 0) {
        await knex(coilSettingPath).insert(item)
      }
    }
  }
}
