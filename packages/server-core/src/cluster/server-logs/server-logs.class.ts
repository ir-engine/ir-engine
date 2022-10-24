import { BadRequest } from '@feathersjs/errors/lib'
import { Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { getServerLogs } from './server-logs-helper'

export class ServerLogs implements ServiceMethods<any> {
  app: Application
  options: any

  constructor(options: any, app: Application) {
    this.options = options
    this.app = app
  }

  async find(params?: Params): Promise<string> {
    if (!params?.query?.podName) {
      logger.info('podName is required in request to find server logs')
      throw new BadRequest('podName is required in request to find server logs')
    } else if (!params?.query?.containerName) {
      logger.info('containerName is required in request to find server logs')
      throw new BadRequest('containerName is required in request to find server logs')
    }

    return getServerLogs(params?.query?.podName, params?.query?.containerName, this.app)
  }

  async get(): Promise<any> {}
  async create(): Promise<any> {}
  async update(): Promise<any> {}
  async remove(): Promise<any> {}
  async patch(): Promise<any> {}
}
