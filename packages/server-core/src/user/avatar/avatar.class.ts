import { Params, ServiceMethods, ServiceOptions } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { uploadAvatarStaticResource, getAvatarFromStaticResources } from './avatar-helper'

/**
 * This class used to find user
 * and returns founded users
 */
export class Avatar implements ServiceMethods<any> {
  app: Application
  options: ServiceOptions

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }
  async setup() {}

  async get(name: string, params: Params): Promise<any> {
    return (await getAvatarFromStaticResources(this.app, name))[0]
  }

  async find(params: Params): Promise<any> {
    return await getAvatarFromStaticResources(this.app)
  }

  async create(data: any, params?: Params) {
    return uploadAvatarStaticResource(this.app, data, params)
  }

  async update(id: string, data: any, params: Params): Promise<void> {}
  async patch(id: string, data: any, params: Params): Promise<void> {}
  async remove(id: string, params: Params): Promise<void> {}
}
