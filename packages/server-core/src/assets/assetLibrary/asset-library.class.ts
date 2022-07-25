import { Id, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import extract from 'extract-zip'
import fs from 'fs'
import path from 'path'

import { Application } from '@xrengine/server-core/declarations'

import config from '../../appconfig'

interface CreateParams {
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

  async find(params?: Params): Promise<any> {
    return {}
  }

  async get(id: Id, params?: Params): Promise<any> {
    return {}
  }

  async update(id: Id, params?: Params): Promise<any> {
    return {}
  }

  async patch(id: Id, params?: Params): Promise<any> {
    return {}
  }

  async remove(id: Id, params?: Params): Promise<any> {
    return {}
  }

  async setup() {}

  async create(createParams: CreateParams, params?: Params): Promise<any> {
    try {
      const inPath = decodeURI(createParams.path)
      const pathData = /.*projects\/([\w\d\s\-_]+)\/assets\/([\w\d\s\-_]+).zip$/.exec(inPath)
      if (!pathData) throw new Error('could not extract path data')
      const [_, projectName, fileName] = pathData
      const assetRoot = `${projectName}/assets/${fileName}`
      const fullPath = path.join(this.rootPath, assetRoot)
      fs.mkdirSync(fullPath)
      await extract(`${fullPath}.zip`, { dir: fullPath })
      return { assetRoot: assetRoot }
    } catch (e) {
      throw new Error('error unzipping archive:', e)
    }
  }
}
