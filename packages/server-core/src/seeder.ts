import { Paginated } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import { Service } from 'feathers-sequelize'
import fs from 'fs'
import path from 'path'

import { Application } from '../declarations'
import config from './appconfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from './projects/project/project.class'
import seederConfig from './seeder-config'

function matchesTemplateValues(template: any, row: any) {
  for (const key of Object.keys(template)) {
    if (typeof template[key] !== 'object' && template[key] !== row[key]) return false
  }
  return true
}

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (!forceRefresh && !prepareDb) return

  const insertionPromises = seederConfig.map(async (config) => {
    if (!config.path || !config.templates) return

    const service = app.service(config.path as any) as Service

    // setting tables only need to be seeded once
    if (config.path?.endsWith('setting')) {
      const result = (await service.find()) as Paginated<any>
      const isSeeded = result.total > 0
      if (isSeeded) return
    }

    const searchTemplates = config.templates?.map((template) => {
      if (template.id) return { id: template.id }
      else return template
    })

    const results = (await service.find({
      query: { $or: searchTemplates },
      paginate: {
        // @ts-ignore - https://github.com/feathersjs/feathers/issues/3129
        default: 1000,
        max: 1000
      }
    })) as Paginated<unknown>

    const templatesToBeInserted = config.templates.filter((template) => {
      return (
        results.data.findIndex((row) => {
          return matchesTemplateValues(template, row)
        }) === -1
      )
    })

    if (!templatesToBeInserted.length) return

    console.log('inerserting templates', templatesToBeInserted)

    if (config.insertSingle) {
      // NOTE: some of our services do not follow standard feathers service conventions,
      // and break when passed an array of objects to the create method
      return Promise.all(templatesToBeInserted.map((template) => service.create(template)))
    } else {
      return service.create(templatesToBeInserted)
    }
  })

  await Promise.all(insertionPromises)

  console.log('seeder done')

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
