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

  async find(params?: Params): Promise<[{ key: string; value: string }]> {
    const result = await this.app.service('project').find(params)
    return result?.data[0]?.settings ? JSON.parse(result.data[0].settings) : []
  }

  async patch(id: Id, data: { settings: string }, params?: Params): Promise<any> {
    return this.app.service('project').updateSettings(id, data)
  }

  async setup(): Promise<any> {}

  async get(): Promise<any> {}

  async create(): Promise<any> {}

  async remove(): Promise<any> {}

  async update(): Promise<any> {}
}
