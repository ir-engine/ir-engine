import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { Application } from '../declarations'
import config from './appconfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from './projects/project/project.class'
import seederConfig from './seeder-config'

const settingsServiceNames = [
  'analytics-setting',
  'authentication-setting',
  'aws-setting',
  'chargebee-setting',
  'coil-setting',
  'client-setting',
  'email-setting',
  'instance-server-setting',
  'redis-setting',
  'server-setting'
]

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (forceRefresh || prepareDb)
    for (let config of seederConfig) {
      if (config.path) {
        const templates = config.templates
        const service = app.service(config.path as any)
        if (templates)
          for (let template of templates) {
            let isSeeded
            if (settingsServiceNames.indexOf(config.path) > -1) {
              const result = await service.find()
              isSeeded = result.total > 0
            } else {
              const searchTemplate = {}

              const sequelizeModel = service.Model
              const uniqueField = Object.values(sequelizeModel.rawAttributes).find((value: any) => value.unique) as any
              if (uniqueField) searchTemplate[uniqueField.fieldName] = template[uniqueField.fieldName]
              else
                for (let key of Object.keys(template))
                  if (typeof template[key] !== 'object') searchTemplate[key] = template[key]
              const result = await service.find({
                query: searchTemplate
              })
              isSeeded = result.total > 0
            }
            if (!isSeeded) await service.create(template)
          }
      }
    }

  if (forceRefresh) {
    // for local dev clear the storage provider
    if (!config.kubernetes.enabled) {
      const uploadPath = path.resolve(appRootPath.path, 'packages/server/upload/')
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true })
    }
    copyDefaultProject()
    await app.service('project')._seedProject('default-project')
    await uploadLocalProjectToProvider('default-project')
    if (!config.kubernetes.enabled) await app.service('project')._fetchDevLocalProjects()
  }
}
