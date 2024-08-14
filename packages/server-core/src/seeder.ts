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
import fs from 'fs'
import path from 'path'

import { projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'

import { Application } from '../declarations'
import config from './appconfig'
import { copyDefaultProject } from './projects/project/project-helper'
import { knexSeeds } from './seeder-config'
import multiLogger from './ServerLogger'

const logger = multiLogger.child({ component: 'server-core:seeder' })

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (forceRefresh || prepareDb) {
    logger.info('Seeding or preparing database')

    const knexClient = app.get('knexClient')
    for (const seedFile of knexSeeds) {
      await seedFile.seed(knexClient)
    }
  }

  if (prepareDb) return

  if (forceRefresh) {
    logger.info('Refreshing default project')
    // for local dev clear the storage provider
    if (!config.kubernetes.enabled && !config.testEnabled) {
      const uploadPath = path.resolve(appRootPath.path, 'packages/server/upload/')
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true })
    }
    copyDefaultProject()
    if (config.kubernetes.enabled || config.testEnabled) await app.service(projectPath)._seedProject('default-project')
  }

  if (!config.kubernetes.enabled && !config.testEnabled) await app.service(projectPath)._syncDevLocalProjects()
}
