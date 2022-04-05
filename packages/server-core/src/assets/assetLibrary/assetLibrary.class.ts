import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import extract from 'extract-zip'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize/types'
import fs from 'fs'
import path from 'path'

import { Application } from '@xrengine/server-core/declarations'

import config from '../../appconfig'

export type CreateParams = {
  projectName: string
  path: string
  zippedGLTF: boolean
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

  /**
   * query the asset library for assets matching search conditions
   * @param params
   */
  async find(params?: Params): Promise<any> {}

  /**
   * create a new asset
   * @param data
   * @param params
   */
  async create(data: CreateParams, params?: Params): Promise<any> {
    if (data.zippedGLTF) {
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
        throw Error('error unzipping glTF:', e)
      }
    }
  }

  async patch(id: NullableId, data: Partial<any>, params?: Params): Promise<any> {}

  /**
   * overwrite existing asset
   * @param id
   * @param data
   * @param params
   */
  async update(id: NullableId, data: Partial<any>, params?: Params): Promise<any> {}

  async remove(id: NullableId, params?: Params): Promise<any> {}

  async get(id: Id, params: Params) {
    if (id.valueOf() === 'storage-provider') {
      return config.server.storageProvider
    }
  }
}
