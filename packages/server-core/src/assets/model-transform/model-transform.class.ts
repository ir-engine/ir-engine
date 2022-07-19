import { Id, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import path from 'path'

import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransformLoader'
import { Application } from '@xrengine/server-core/declarations'

import { transformModel } from './model-transform.helpers'

interface CreateParams {
  path: string
  transformParameters: ModelTransformParameters
}

export class ModelTransform implements ServiceMethods<any> {
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
      const transformParms = createParams.transformParameters
      const pathData = /.*projects\/([\w\d\s\-_]+)\/assets\/([\w\d\s\-_]+).glb$/.exec(createParams.path)
      if (!pathData) throw Error('could not extract path data')
      const [_, projectName, fileName] = pathData
      const commonPath = path.join(this.rootPath, `${projectName}/assets/${fileName}`)
      const inPath = `${commonPath}.glb`
      const outPath = `${commonPath}-transformed.glb`
      return await transformModel(this.app, { src: inPath, dst: outPath, parms: transformParms })
    } catch (e) {
      console.error('error transforming model')
      console.error(e)
    }
  }
}
