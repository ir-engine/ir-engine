import { Id, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import path from 'path'

import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransformLoader'
import { Application } from '@xrengine/server-core/declarations'

import { getModelResources, transformModel } from './model-transform.helpers'

interface CreateParams {
  path: string
  transformParameters: ModelTransformParameters
}

interface GetParams {
  filter: string
}

export class ModelTransform implements ServiceMethods<any> {
  app: Application
  docs: any
  rootPath: string

  constructor(app: Application) {
    this.app = app
    this.rootPath = path.join(appRootPath.path, 'packages/projects/projects/')
  }

  processPath(inPath: string): string {
    const pathData = /.*projects\/([\w\d\s\-_]+)\/assets\/([\w\d\s\-_]+).glb$/.exec(inPath)
    if (!pathData) throw Error('could not extract path data')
    const [_, projectName, fileName] = pathData
    const commonPath = path.join(this.rootPath, `${projectName}/assets/${fileName}`)
    return commonPath
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

  async patch(id: Id, findParams: GetParams, params?: Params): Promise<any> {
    try {
      const src: string = id as string
      const commonPath = this.processPath(src)
      const inPath = `${commonPath}.glb`
      const resources = await getModelResources(this.app, { src: inPath, filter: findParams.filter ?? '' })
      return resources
    } catch (e) {
      console.error('error getting model resources')
      console.error(e)
    }
  }

  async remove(id: Id, params?: Params): Promise<any> {
    return {}
  }

  async setup() {}

  async create(createParams: CreateParams, params?: Params): Promise<any> {
    try {
      const transformParms = createParams.transformParameters
      const commonPath = this.processPath(createParams.path)
      const inPath = `${commonPath}.glb`
      const outPath = `${commonPath}-transformed.glb`
      return await transformModel(this.app, { src: inPath, dst: outPath, parms: transformParms })
    } catch (e) {
      console.error('error transforming model')
      console.error(e)
    }
  }
}
