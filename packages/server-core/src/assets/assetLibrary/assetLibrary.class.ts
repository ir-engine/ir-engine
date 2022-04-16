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

export class AssetLibrary extends Service<any> {
  app: Application

  rootPath: string

  constructor(app: Application) {
    super(app)
    this.app = app
    this.rootPath = path.join(appRootPath.path, 'packages/projects/projects/')
  }

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
    return super.create(data, params)
  }
}
