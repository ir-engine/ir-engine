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

/* eslint-disable @typescript-eslint/no-var-requires */
import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import Sequelize, { DataTypes } from 'sequelize'

import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'
import { ServerMode } from '@etherealengine/server-core/src/ServerState'

dotenv.config({
  path: appRootPath.path,
  silent: true
})
const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

cli.main(async () => {
  try {
    const app = createFeathersKoaApp(ServerMode.API)
    await app.setup()

    // @ts-ignore
    const sequelizeClient = new Sequelize({
      ...db,
      logging: console.log,
      define: {
        freezeTableName: true
      }
    })

    await sequelizeClient.sync()

    const StaticResource = sequelizeClient.define('static_resource', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sid: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      name: DataTypes.STRING,
      key: DataTypes.STRING,
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      LOD0_url: {
        type: DataTypes.STRING,
        allowNull: true
      }
    })

    const staticResources = await StaticResource.findAll({
      paginate: false,
      where: {
        url: null
      }
    })

    console.log('static resources', staticResources)

    for (const resource of staticResources) {
      if (resource.LOD0_url && resource.url == null)
        await app.service('static-resource').Model.update(
          {
            url: resource.LOD0_url
          },
          {
            where: {
              id: resource.id
            }
          }
        )
    }
    cli.ok(`All static resources updated`)

    process.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
