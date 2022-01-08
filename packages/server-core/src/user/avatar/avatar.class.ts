import { Params, ServiceMethods, ServiceOptions } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import { AvatarUploadArguments, getAvatarFromStaticResources, uploadAvatarStaticResource } from './avatar-helper'

export class Avatar implements ServiceMethods<any> {
  app: Application
  options: ServiceOptions

  constructor(options = {}, app: Application) {
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

  async create(data: AvatarUploadArguments, params?: Params) {
    return uploadAvatarStaticResource(this.app, data, params)
  }

  async update(id: string, data: any, params: Params): Promise<void> {}
  async patch(id: string, data: any, params: Params): Promise<void> {}
  async remove(id: string, params: Params): Promise<void> {
    // TODO: implement avatar removal
  }
}
