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

import { DataTypes, Sequelize } from 'sequelize'

export const getClientSetting = async () => {
  const db = {
    username: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    database: process.env.MYSQL_DATABASE ?? 'etherealengine',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: process.env.MYSQL_PORT ?? 3306,
    dialect: 'mysql',
    url: ''
  }

  db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`
  const sequelizeClient = new Sequelize({
    ...db,
    define: {
      freezeTableName: true
    },
    logging: false
  } as any) as any
  await sequelizeClient.sync()
  const ClientSetting = sequelizeClient.define('client-setting', {
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    releaseName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    siteDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appleTouchIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    favicon32px: {
      type: DataTypes.STRING,
      allowNull: true
    },
    favicon16px: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon192px: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon512px: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const clientSetting = await ClientSetting.findAll()
    .then(([dbClient]) => {
      const dbClientConfig = (dbClient && {
        logo: dbClient.logo,
        title: dbClient.title,
        url: dbClient.url,
        releaseName: dbClient.releaseName,
        siteDescription: dbClient.siteDescription,
        appleTouchIcon: dbClient.appleTouchIcon,
        favicon32px: dbClient.favicon32px,
        favicon16px: dbClient.favicon16px,
        icon192px: dbClient.icon192px,
        icon512px: dbClient.icon512px
      }) || {
        logo: './logo.svg',
        title: 'Ethereal Engine',
        url: 'https://local.etherealengine.org',
        releaseName: 'local',
        siteDescription: 'Connected Worlds for Everyone',
        appleTouchIcon: '/apple-touch-icon.png',
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
      console.warn('[vite.config.js]: Failed to read client-setting')
      console.warn(e)
    })

  return clientSetting!
}
