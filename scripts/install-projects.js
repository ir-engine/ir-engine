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

import { projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import logger from '@etherealengine/server-core/src/ServerLogger'
import { ServerMode } from '@etherealengine/server-core/src/ServerState'
import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'
import { createDefaultStorageProvider } from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { download } from '@etherealengine/server-core/src/projects/project/downloadProjects'
import { getProjectConfig, onProjectEvent } from '@etherealengine/server-core/src/projects/project/project-helper'
import appRootPath from 'app-root-path'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createScenes } from "@etherealengine/server-core/src/util/createScenes";

dotenv.config()
const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql'
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

async function installAllProjects() {
  try {
    const app = createFeathersKoaApp(ServerMode.API)
    await app.setup()
    createDefaultStorageProvider()
    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects')
    if (!fs.existsSync(localProjectDirectory)) fs.mkdirSync(localProjectDirectory, { recursive: true })
    logger.info('running installAllProjects')

    const projects = await app.service(projectPath).find({ paginate: false })
    logger.info('found projects %o', projects)
    await Promise.all(projects.map((project) => download(project.name)))
    await app.service(projectPath).update('', { sourceURL: 'default-project' }, { isInternal: true, isJob: true })
    const projectConfig = getProjectConfig('default-project') ?? {}
    if (projectConfig.onEvent) await onProjectEvent(app, 'default-project', projectConfig.onEvent, 'onUpdate')
    await createScenes(app, 'default-project')
    process.exit(0)
  } catch (e) {
    logger.fatal(e)
    console.error(e)
    process.exit(1)
  }
}

installAllProjects()
