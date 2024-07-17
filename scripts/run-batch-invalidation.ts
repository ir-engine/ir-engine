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

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { invalidationPath } from '@etherealengine/common/src/schema.type.module'
import { createFeathersKoaApp, serverJobPipe } from '@etherealengine/server-core/src/createApp'
import { getStorageProvider } from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
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

const options = cli.parse({
  repoName: [false, 'Name of repo', 'string'],
  tag: [false, 'Commit Tag', 'string'],
  repoUrl: [false, 'Docker repository', 'string'],
  startTime: [false, 'Timestamp of image', 'string']
})

const encodeCloudfrontInvalidation = (uri: string) =>
  encodeURI(
    uri
      .replaceAll('%', '%25')
      .replaceAll(' ', '+')
      .replaceAll('"', '%22')
      .replaceAll('#', '%23')
      .replaceAll('<', '%3C')
      .replaceAll('>', '%3E')
      .replaceAll('[', '%5B')
      .replaceAll('\\', '%5C')
      .replaceAll(']', '%5D')
      .replaceAll('^', '%5E')
      .replaceAll('`', `%60`)
      .replaceAll('{', '%7B')
      .replaceAll('|', '%7C')
      .replaceAll('}', '%7D')
      .replaceAll('~', '%7E')
      .replaceAll("'", '%27')
  )

cli.main(async () => {
  try {
    const app = createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const invalidations = await app.service(invalidationPath).find({
      query: {
        $limit: 3000,
        $sort: {
          createdAt: 1
        }
      },
      paginate: false
    })
    if (invalidations.length > 0) {
      let pathArray: string[] = []
      let idArray: string[] = []
      let numWildcards = 0

      for (let invalidation of invalidations) {
        const isWildcard = invalidation.path.match(/\*/)
        if (isWildcard && numWildcards > 5) continue
        pathArray.push(encodeCloudfrontInvalidation(invalidation.path))
        idArray.push(invalidation.id)
        if (isWildcard) numWildcards++
      }

      pathArray = [...new Set(pathArray)]
      const storageProvider = getStorageProvider()
      await storageProvider.createInvalidation(pathArray)
      await app.service(invalidationPath).remove(null, {
        query: {
          id: {
            $in: idArray
          }
        }
      })
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
