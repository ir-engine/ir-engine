import { Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import knex from 'knex'

export const coilSettingPath = 'coil-setting'
export const coilSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    paymentPointer: Type.String(),
    clientId: Type.String(),
    clientSecret: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'CoilSetting', additionalProperties: false }
)
export type CoilSettingType = Static<typeof coilSettingSchema>

export const getCoilSetting = async () => {
  const knexClient = knex({
    client: 'mysql',
    connection: {
      user: process.env.MYSQL_USER ?? 'server',
      password: process.env.MYSQL_PASSWORD ?? 'password',
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE ?? 'etherealengine',
      charset: 'utf8mb4'
    }
  })

  const coilSetting = await knexClient
    .select()
    .from<CoilSettingType>(coilSettingPath)
    .then(([dbCoil]) => {
      if (dbCoil) {
        return dbCoil
      }
    })
    .catch((e) => {
      console.warn('[vite.config]: Failed to read coilSetting')
      console.warn(e)
    })

  return coilSetting!
}
