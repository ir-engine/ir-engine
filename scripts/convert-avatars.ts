/* eslint-disable @typescript-eslint/no-var-requires */
import appRootPath from 'app-root-path'
import axios from 'axios'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fetch from 'node-fetch'
import Sequelize, { DataTypes, Op } from 'sequelize'

import { ServerMode } from '@xrengine/server-core/declarations'
import { createFeathersExpressApp } from '@xrengine/server-core/src/createApp'
import { getCachedURL } from '@xrengine/server-core/src/media/storageprovider/getCachedURL'
import { addGenericAssetToS3AndStaticResources } from '@xrengine/server-core/src/media/upload-asset/upload-asset.service'

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
  dialect: 'mysql'
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

cli.main(async () => {
  try {
    const app = createFeathersExpressApp(ServerMode.API)
    const sequelizeClient = new Sequelize({
      ...db,
      logging: true,
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
        staticResourceType: {
          [Op.ne]: null
        }
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
      let existingAvatar = await app.service('avatar').find({
        query: {
          name: avatar
        }
      })
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

      const thumbnailReturned = await addGenericAssetToS3AndStaticResources(
        app,
        Buffer.from(await thumbnail.arrayBuffer()),
        thumbnail.headers.get('content-type') || '',
        {
          key: `avatars/public/${existingAvatar.identifierName}.glb.${
            /.png/.test(thumbnail.headers.get('content-type') || '') ? 'png' : 'jpg'
          }`,
          staticResourceType: 'user-thumbnail'
        }
      )

      const modelReturned = await addGenericAssetToS3AndStaticResources(
        app,
        Buffer.from(await model.arrayBuffer()),
        (await model.headers.get('content-type')) || '',
        {
          key: `avatars/public/${existingAvatar.identifierName}.glb`,
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
