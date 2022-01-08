import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'

import { Application } from '../../../declarations'
import Compiler from './compiler'

const compiler = new Compiler()

const compileTemplate = (template) => {
  return compiler.compile(template)
}

export const seedApp = async (app: Application, services: Array<ServicesSeedConfig>) => {
  console.log('Seeding app...')

  const promises: any[] = []

  for (const cfg of services) {
    promises.push(seed(app, cfg))
  }

  return await Promise.all(promises)
}

const seed = async (app: Application, cfg: ServicesSeedConfig) => {
  if (!cfg.path) {
    throw new Error('You must include the path of every service you want to seed.')
  }
  if (!cfg.templates) {
    throw new Error('You must specify an array of templates for seeded objects.')
  }

  const service = app.service(cfg.path)
  await service.remove(null, null)

  const pushPromise = async (template) => {
    const compiled = compileTemplate(template)
    if (!cfg.path) return []
    const created = await service.create(compiled, null)
    if (typeof cfg.callback === 'function') {
      await cfg.callback(created, (...args) => seed(app, ...args))
    }
    return created
  }

  const promises: any[] = []
  for (let i = 0; i < cfg.templates.length; i++) {
    const template = cfg.templates[i]
    promises.push(pushPromise(template))
  }

  return await Promise.all(promises)
}
