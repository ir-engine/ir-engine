import { FeathersService } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { Application } from '../declarations'
import config from './appconfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from './projects/project/project.class'
import seederConfig from './seeder-config'

export async function seeder(app: Application, forceRefresh: boolean, prepareDb: boolean) {
  if (!forceRefresh && !prepareDb) return

  for (const config of seederConfig) {
    if (!config.path || !config.templates) return

    const templates = config.templates

    const service = app.service(config.path as any) as FeathersService

    await service.create(templates)
  }

  if (forceRefresh) {
    // for local dev clear the storage provider
    if (!config.kubernetes.enabled && !config.testEnabled) {
      const uploadPath = path.resolve(appRootPath.path, 'packages/server/upload/')
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true })
    }
    copyDefaultProject()
    await app.service('project')._seedProject('default-project')
    await uploadLocalProjectToProvider('default-project')
    if (!config.kubernetes.enabled) await app.service('project')._fetchDevLocalProjects()
  }
}
