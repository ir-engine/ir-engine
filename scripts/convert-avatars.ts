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
import fetch from 'node-fetch'
import Sequelize, { DataTypes, Op } from 'sequelize'

import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'
import { addAssetAsStaticResource } from '@etherealengine/server-core/src/media/upload-asset/upload-asset.service'
import { ServerMode } from '@etherealengine/server-core/src/ServerState'

dotenv.config({
  path: appRootPath.path,
  silent: true
})
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

    const User = sequelizeClient.define('user', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      avatarId: {
        type: DataTypes.STRING
      }
    })

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
      staticResourceType: {
        type: DataTypes.STRING
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    })

    const avatarStaticResources = await StaticResource.findAll({
      where: {
        staticResourceType: 'avatar'
      }
    })

    const currentAvatars = {}

    for (const i of avatarStaticResources) {
      const name = i.name
      if (!currentAvatars[name]) currentAvatars[name] = {}
      currentAvatars[name][i.staticResourceType] = i
    }

    for (const avatar of Object.keys(currentAvatars)) {
      const current = currentAvatars[avatar]
      let existingAvatar = (await app.service('avatar').find({
        query: {
          name: avatar
        }
      })) as any
      if (existingAvatar.total === 0) {
        existingAvatar = await app.service('avatar').create({
          name: avatar
        })
      } else {
        existingAvatar = existingAvatar.data[0]
      }
      await app.service('avatar').patch(existingAvatar.id, {
        identifierName: existingAvatar.name + '_' + existingAvatar.id
      })
      existingAvatar = await app.service('avatar').get(existingAvatar.id)

      const model = await fetch(current.avatar.url)
      const thumbnail = await fetch(current['user-thumbnail'].url)
      const thumbSize = thumbnail.headers.get('content-length')
      const modelSize = model.headers.get('content-length')
      const thumbName = `${existingAvatar.identifierName}.glb.${
        /.png/.test(thumbnail.headers.get('content-type') || '') ? 'png' : 'jpg'
      }`

      const thumbnailReturned = await addAssetAsStaticResource(
        app,
        [
          {
            buffer: Buffer.from(await thumbnail.arrayBuffer()),
            originalname: thumbName,
            mimetype: thumbnail.headers.get('content-type') || 'image/png',
            size: thumbSize ? parseInt(thumbSize) : 0
          }
        ],
        {
          path: `avatars/public/`,
          staticResourceType: 'user-thumbnail'
        }
      )

      const modelReturned = await addAssetAsStaticResource(
        app,
        [
          {
            buffer: Buffer.from(await model.arrayBuffer()),
            originalname: `${existingAvatar.identifierName}.glb`,
            mimetype: model.headers.get('content-type') || 'model/gltf-binary',
            size: modelSize ? parseInt(modelSize) : 0
          }
        ],
        {
          path: `avatars/public/`,
          staticResourceType: 'avatar'
        }
      )
      await app.service('avatar').patch(existingAvatar.id, {
        modelResourceId: modelReturned.id,
        thumbnailResourceId: thumbnailReturned.id
      })
      const matchingUsers = await User.findAll({
        where: {
          avatarId: existingAvatar.name
        }
      })
      await User.update(
        {
          avatarId: existingAvatar.id
        },
        {
          where: {
            avatarId: existingAvatar.name
          }
        }
      )
    }

    cli.ok(`All avatars updated`)

    process.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
