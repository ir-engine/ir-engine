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

import { projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { Application } from '../declarations'
import multiLogger from './ServerLogger'
import config from './appconfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from './projects/project/project-helper'
import { knexSeeds, sequelizeSeeds } from './seeder-config'

const logger = multiLogger.child({ component: 'server-core:seeder' })

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (forceRefresh || prepareDb) {
    logger.info('Seeding or preparing database')

    const knexClient = app.get('knexClient')
    for (const seedFile of knexSeeds) {
      seedFile.seed(knexClient)
    }

    for (const config of sequelizeSeeds) {
      if (config.path) {
        const templates = config.templates
        const service = app.service(config.path as any)
        if (templates)
          for (const template of templates) {
            let isSeeded
            if (config.path.endsWith('-setting')) {
              const result = await service.find()
              isSeeded = result.total > 0
            } else {
              const searchTemplate = {}

              const sequelizeModel = service.Model
              const uniqueField = Object.values(sequelizeModel.rawAttributes).find((value: any) => value.unique) as any
              if (uniqueField) searchTemplate[uniqueField.fieldName] = template[uniqueField.fieldName]
              else
                for (const key of Object.keys(template))
                  if (typeof template[key] !== 'object') searchTemplate[key] = template[key]
              const result = await service.find({
                query: searchTemplate
              })
              isSeeded = result.total > 0
            }
            if (!isSeeded) await service.create(template)
            logger.info({ template, configPath: config.path }, 'Creating template')
          }
      }
    }
  }

  if (forceRefresh) {
    logger.info(forceRefresh, 'Refreshing default project')
    // for local dev clear the storage provider
    if (!config.kubernetes.enabled && !config.testEnabled) {
      const uploadPath = path.resolve(appRootPath.path, 'packages/server/upload/')
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true })
    }
    copyDefaultProject()
    await app.service(projectPath)._seedProject('default-project')
    await uploadLocalProjectToProvider(app, 'default-project')
    if (!config.kubernetes.enabled && !config.testEnabled) await app.service(projectPath)._fetchDevLocalProjects()
  }
}
