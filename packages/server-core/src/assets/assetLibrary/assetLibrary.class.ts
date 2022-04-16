import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import extract from 'extract-zip'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize/types'
import fs from 'fs'
import path from 'path'

import { Application } from '@xrengine/server-core/declarations'

import config from '../../appconfig'

export type CreateParams = {
  path: string
}

export class AssetLibrary implements ServiceMethods<any> {
  app: Application
  docs: any

  rootPath: string

  constructor(app: Application) {
    this.app = app
    this.rootPath = path.join(appRootPath.path, 'packages/projects/projects/')
  }

  async setup() {}

  async find(params?: Params): Promise<any> {}

  /**
   * create a new asset
   * @param data
   * @param params
   */
  async create(data: CreateParams, params?: Params): Promise<any> {
    try {
      const pathData = /.*projects\/([\w\d\s]+)\/assets\/([\w\d\s]+).zip$/.exec(data.path)
      if (!pathData) throw Error('could not extract path data')
      const [_, projectName, fileName] = pathData
      const assetRoot = `${projectName}/assets/${fileName}`
      const fullPath = path.join(this.rootPath, assetRoot)
      await new Promise<void>((resolve) => {
        fs.mkdir(fullPath, () => {
          resolve()
        })
      })
      await extract(`${fullPath}.zip`, { dir: fullPath })
    } catch (e) {
      throw Error('error unzipping archive:', e)
    }
  }

  async patch(id: NullableId, data: Partial<any>, params?: Params): Promise<any> {}

  async update(id: NullableId, data: Partial<any>, params?: Params): Promise<any> {}

  async remove(id: NullableId, params?: Params): Promise<any> {}

  async get(id: Id, params?: Params) {}
}
