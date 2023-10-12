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
import knex from 'knex'
/* eslint-disable @typescript-eslint/no-var-requires */
import { StaticResourceType, staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { ServerMode } from '@etherealengine/server-core/src/ServerState'
import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'

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

const options = cli.parse({
  subdomainFrom: [true, 'Old subdomain', 'string'],
  subdomainTo: [true, 'New subdomain', 'string']
})

cli.main(async () => {
  try {
    const knexClient = knex({
      client: 'mysql',
      connection: {
        user: process.env.MYSQL_USER ?? 'server',
        password: process.env.MYSQL_PASSWORD ?? 'password',
        host: process.env.MYSQL_HOST ?? '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        database: process.env.MYSQL_DATABASE ?? 'xengine',
        charset: 'utf8mb4'
      }
    })

    console.log('options', options)
    const app = createFeathersKoaApp(ServerMode.API)
    await app.setup()

    const staticResources = await knexClient.from<StaticResourceType>(staticResourcePath)

    console.log('static resources', staticResources)

    for (const resource of staticResources) {
      let url = resource.url
      if (new RegExp(options.subdomainFrom).test(url)) {
        console.log('resource.id', resource.id)
        console.log('old URL', url)
        url = url.replace(options.subdomainFrom, options.subdomainTo)
        console.log('new URL', url)
        await knexClient
          .from<StaticResourceType>(staticResourcePath)
          .where({
            id: resource.id
          } as any)
          .update({
            url: url
          })
      }
    }
    cli.ok(`All static resources updated with new subdomain`)

    process.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
