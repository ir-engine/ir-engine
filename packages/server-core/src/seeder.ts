import { FeathersService } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import fs from 'fs'
import { isEqual } from 'lodash'
import path from 'path'
import { Model, ModelStatic, Op } from 'sequelize'

import { ServicesSeedConfig } from '@etherealengine/common/src/interfaces/ServicesSeedConfig'

import { Application } from '../declarations'
import config from './appconfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from './projects/project/project.class'
import seederConfig from './seeder-config'

async function insertOneByOne(app: Application, config: ServicesSeedConfig) {
  const service = app.service(config.path as any) as FeathersService
  const templates = config.templates as any[]

  const Model = (service as any).Model as ModelStatic<Model>

  const templateInsertionPromises = templates.map(
    (template) =>
      new Promise(async (resolve) => {
        const searchTemplate = {}

        const uniqueField = Object.values(Model.rawAttributes).find((value: any) => value.unique) as any

        if (uniqueField) {
          searchTemplate[uniqueField.fieldName] = template[uniqueField.fieldName]
        } else {
          for (const key of Object.keys(template)) {
            if (typeof template[key] !== 'object' && template[key]) {
              searchTemplate[key] = template[key]
            }
          }
        }

        const result = await service.find({
          query: searchTemplate
        })
        const isSeeded = result.total > 0

        let insertionResult: any
        if (!isSeeded) insertionResult = await service.create(template)

        resolve(insertionResult)
      })
  )

  return Promise.all(templateInsertionPromises)
}

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (!forceRefresh && !prepareDb) return

  const insertionPromises = seederConfig
    .filter((config) => config.path && config.templates)
    .map(
      (config) =>
        new Promise(async (resolve) => {
          if (config.insertSingle) {
            resolve(await insertOneByOne(app, config))
            return
          }

          const templates = config.templates as any[]

          const Model = app.service(config.path as any).Model as ModelStatic<Model>

          const rows = await Model.findAll({
            where: {
              [Op.or]: templates
            },
            attributes: Object.keys(templates.at(0)),
            raw: true
          })

          const templatesToBeInserted = templates.filter(
            (template) => rows.findIndex((row) => isEqual(row, template)) === -1
          )

          const service = app.service(config.path as any) as FeathersService

          resolve(await service.create(templatesToBeInserted))
        })
    )

  await Promise.all(insertionPromises)

  if (forceRefresh) {
    // for local dev clear the storage provider
    if (!config.kubernetes.enabled && !config.testEnabled) {
      const uploadPath = path.resolve(appRootPath.path, 'packages/server/upload/')
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true })
    }
    copyDefaultProject()
    await app.service('project')._seedProject('default-project')
    await uploadLocalProjectToProvider(app, 'default-project')
    if (!config.kubernetes.enabled && !config.testEnabled) await app.service('project')._fetchDevLocalProjects()
  }
}
