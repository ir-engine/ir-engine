/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import knex from 'knex'

import { clientDbToSchema } from '../../server-core/src/setting/client-setting/client-setting.resolvers'

const {
  clientSettingPath,
  ClientSettingDatabaseType
} = require('../../common/src/schemas/setting/client-setting.schema')

export const getClientSetting = async () => {
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

  const clientSetting = await knexClient
    .select()
    .from<typeof ClientSettingDatabaseType>(clientSettingPath)
    .then(([dbClient]) => {
      const dbClientConfig = clientDbToSchema(dbClient) || {
        logo: './logo.svg',
        title: 'Ethereal Engine',
        url: 'https://local.etherealengine.org',
        releaseName: 'local',
        siteDescription: 'Connected Worlds for Everyone',
        favicon32px: '/favicon-32x32.png',
        favicon16px: '/favicon-16x16.png',
        icon192px: '/android-chrome-192x192.png',
        icon512px: '/android-chrome-512x512.png'
      }
      if (dbClientConfig) {
        return dbClientConfig
      }
    })
    .catch((e) => {
      console.warn('[vite.config]: Failed to read clientSetting')
      console.warn(e)
    })

  await knexClient.destroy()

  return clientSetting!
}
