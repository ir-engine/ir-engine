/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// This must always be imported first
import '@ir-engine/server-core/src/patchEngineNode'

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { UserID } from '@ir-engine/hyperflux'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'
import { createFeathersKoaApp, serverJobPipe } from '@ir-engine/server-core/src/createApp'
import { updateAppConfig } from '@ir-engine/server-core/src/updateAppConfig'
import { startProjectPublish } from '../packages/server-core/src/projects/project-publish/project-publish-helper'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'ir-engine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  projectId: [false, 'ID of project to be published', 'string'],
  projectPublishId: [false, 'ID of project publish record', 'string'],
  userId: [false, 'ID of user publishing project', 'string'],
  updatedAt: [false, 'Date and time of publishing', 'string'],
  locations: [false, 'Publish locations data', 'string']
})

cli.main(async () => {
  try {
    await updateAppConfig()
    const app = await createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const { projectId, projectPublishId, userId, updatedAt, locations } = options
    await startProjectPublish(
      app,
      projectId,
      projectPublishId,
      userId as UserID,
      updatedAt,
      JSON.parse(locations),
      false
    )

    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
