import { Id, NullableId, Params, Query, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import path from 'path'

import { ModelTransformParameters } from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { Application } from '@etherealengine/server-core/declarations'

import { transformModel } from './model-transform.helpers'

interface CreateParams {
  src: string
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
    this.rootPath = path.join(appRootPath.path, 'packages/projects/projects')
  }

  patch(id: NullableId, data: Partial<any>, params?: Params<Query> | undefined): Promise<any> {
    return Promise.resolve({})
  }

  processPath(inPath: string): [string, string] {
    const pathData = /.*projects\/(.*)\.(glb|gltf)$/.exec(inPath)
    if (!pathData) throw Error('could not extract path data')
    const [_, filePath, extension] = pathData
    return [path.join(this.rootPath, filePath), extension]
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

  async remove(id: Id, params?: Params): Promise<any> {
    return {}
  }

  async setup() {}

  async create(createParams: CreateParams, params?: Params): Promise<any> {
    try {
      const transformParms = createParams.transformParameters
      const [commonPath, extension] = this.processPath(createParams.src)
      const inPath = `${commonPath}.${extension}`
      const outPath = transformParms.dst
        ? `${commonPath.replace(/[^/]+$/, transformParms.dst)}.${extension}`
        : `${commonPath}-transformed.${extension}`
      const resourceUri = transformParms.resourceUri ?? ''
      return await transformModel(this.app, { src: inPath, dst: outPath, resourceUri, parms: transformParms })
    } catch (e) {
      console.error('error transforming model')
      console.error(e)
    }
  }
}
