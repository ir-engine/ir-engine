/* eslint-disable @typescript-eslint/no-var-requires */
import appRootPath from 'app-root-path'
import axios from 'axios'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fetch from 'node-fetch'
import Sequelize, { DataTypes, Op } from 'sequelize'

import { createFeathersExpressApp } from '@etherealengine/server-core/src/createApp'
import { getCachedURL } from '@etherealengine/server-core/src/media/storageprovider/getCachedURL'
import { addGenericAssetToS3AndStaticResources } from '@etherealengine/server-core/src/media/upload-asset/upload-asset.service'
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
    const app = createFeathersExpressApp(ServerMode.API)
    await app.setup()

    const staticResources = await app.service('static-resource').Model.findAll({
      paginate: false,
      where: {
        LOD0_url: null
      }
    })

    console.log('static resources', staticResources)

    for (const resource of staticResources) {
      if (resource.url && resource.LOD0_url == null)
        await app.service('static-resource').Model.update(
          {
            LOD0_url: resource.url
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
