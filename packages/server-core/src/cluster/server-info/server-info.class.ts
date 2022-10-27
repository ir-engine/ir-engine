import { Params, ServiceMethods } from '@feathersjs/feathers'

import { ServerInfoInterface } from '@xrengine/common/src/interfaces/ServerInfo'

import { Application } from '../../../declarations'
import { getServerInfo } from './server-info-helper'

export class ServerInfo implements ServiceMethods<any> {
  app: Application
  options: any

  constructor(options: any, app: Application) {
    this.options = options
    this.app = app
  }

  async find(params?: Params): Promise<ServerInfoInterface[]> {
    return getServerInfo(this.app)
  }

  async get(): Promise<any> {}
  async create(): Promise<any> {}
  async update(): Promise<any> {}
  async remove(): Promise<any> {}
  async patch(): Promise<any> {}
}
