/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { BadRequest } from '@feathersjs/errors/lib'
import { ServiceInterface } from '@feathersjs/feathers/lib'
import { KnexAdapterParams } from '@feathersjs/knex/lib'
import appRootPath from 'app-root-path'
import path from 'path'

import { ModelTransformParameters } from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { transformModel } from '@ir-engine/common/src/model/ModelTransformFunctions'
import { Application } from '@ir-engine/server-core/declarations'

import config from '../../appconfig'
import { createExecutorJob } from '../../k8s-job-helper'
import { getModelTransformJobBody } from './model-transform.helpers'

export interface ModelTransformParams extends KnexAdapterParams {
  transformParameters: ModelTransformParameters
}

/**
 * A class for Model Transform service
 */
export class ModelTransformService implements ServiceInterface<void> {
  app: Application
  rootPath: string

  constructor(app: Application) {
    this.app = app
    this.rootPath = path.join(appRootPath.path, 'packages/projects/projects')
  }

  processPath(inPath: string): [string, string] {
    const pathData = /.*projects\/(.*)\.(glb|gltf)$/.exec(inPath)
    if (!pathData) throw Error('could not extract path data')
    const [_, filePath, extension] = pathData
    return [path.join(this.rootPath, filePath), extension]
  }

  async create(data: any): Promise<void> {
    const createParams: ModelTransformParameters = data
    console.log('config', config)
    if (!config.kubernetes?.enabled) {
      await transformModel(createParams)
      return
    }
    try {
      const transformParms = createParams
      const [commonPath, extension] = this.processPath(createParams.src)
      const inPath = `${commonPath}.${extension}`
      const outPath = transformParms.dst
        ? `${commonPath.replace(/[^/]+$/, transformParms.dst)}.${extension}`
        : `${commonPath}-transformed.${extension}`
      const resourceUri = transformParms.resourceUri ?? ''
      const jobBody = await getModelTransformJobBody(this.app, createParams)
      const jobLabelSelector = `ir-engine/jobName=${jobBody.metadata!.name},ir-engine/release=${
        process.env.RELEASE_NAME
      },ir-engine/modelTransformer=true`
      const jobId = `model-transform-${inPath}-${outPath}-${resourceUri}`
      const jobFinishedPromise = createExecutorJob(this.app, jobBody, jobLabelSelector, 600, jobId)
      await jobFinishedPromise
      return
    } catch (e) {
      console.log('error transforming model', e)
      throw new BadRequest('error transforming model', e)
    }
  }
}
