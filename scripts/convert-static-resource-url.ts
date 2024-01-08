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
import { StaticResourceDatabaseType, staticResourcePath } from '@etherealengine/common/src/schema.type.module'

import { ServerMode } from '@etherealengine/server-core/src/ServerState'
import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'
import cli from 'cli'
import dotenv from 'dotenv-flow'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

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

    const app = createFeathersKoaApp(ServerMode.API)
    await app.setup()

    type UpdatedStaticResourceType = StaticResourceDatabaseType & {
      LOD0_url: string
    }

    const staticResources = await knexClient.from<UpdatedStaticResourceType>(staticResourcePath).whereNull('url')

    console.log('static resources', staticResources)

    for (const resource of staticResources) {
      if (resource.LOD0_url && resource.url == null)
        await knexClient
          .from<StaticResourceDatabaseType>(staticResourcePath)
          .where({
            id: resource.id
          } as any)
          .update({
            url: resource.LOD0_url
          })
    }
    cli.ok(`All static resources updated`)

    process.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
