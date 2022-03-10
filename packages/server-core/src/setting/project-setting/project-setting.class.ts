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
    const id = params?.projectId || ''
    const key = params?.key || ''
    const result = await this.app.service('project').find({ id: id })

    const settingsValue = JSON.parse(result.settings)

    if (key) {
      let keyValue = ''

      for (let setting of settingsValue) {
        if (setting.key === key) {
          keyValue = setting.value
        }
      }

      return keyValue
    }

    return settingsValue
  }

  async patch(id: Id, params?: Params): Promise<any> {
    const data = params?.data || ''

    const result = await this.app.service('project').patch(id, { settings: JSON.stringify(data) })

    return result
  }

  async setup(): Promise<any> {}

  async get(): Promise<any> {}

  async create(): Promise<any> {}

  async remove(): Promise<any> {}

  async update(): Promise<any> {}
}
