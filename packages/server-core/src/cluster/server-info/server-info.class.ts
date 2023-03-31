import { Params, ServiceMethods } from '@feathersjs/feathers'

import { ServerInfoInterface, ServerPodInfo } from '@etherealengine/common/src/interfaces/ServerInfo'

import { Application } from '../../../declarations'
import { getServerInfo, removePod } from './server-info-helper'

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

  async remove(podName: string, params?: Params): Promise<ServerPodInfo | undefined> {
    return await removePod(this.app, podName)
  }

  async get(): Promise<any> {}
  async create(): Promise<any> {}
  async update(): Promise<any> {}
  async patch(): Promise<any> {}
}
