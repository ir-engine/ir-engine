import { Id, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'

interface Data {}
interface ServiceOptions {}

export class ProjectSetting implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async find(params?: Params): Promise<any> {
    const result = await this.app.service('project').find(params)
    const settingsValue = result?.data[0]?.settings ? JSON.parse(result.data[0].settings) : []
    return settingsValue
  }

  async patch(id: Id, params?: Params): Promise<any> {
    const result = await this.app.service('project').updateSettings(id, params as any)

    return result
  }

  async setup(): Promise<any> {}

  async get(): Promise<any> {}

  async create(): Promise<any> {}

  async remove(): Promise<any> {}

  async update(): Promise<any> {}
}
