/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { ModelTransformParameters } from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { Application } from '@etherealengine/server-core/declarations'
import { ServiceInterface } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import path from 'path'
import config from '../../appconfig'

import { BadRequest } from '@feathersjs/errors'
import { createExecutorJob } from '../../projects/project/project-helper'
import { getModelTransformJobBody, transformModel } from './model-transform.helpers'

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
      return transformModel(this.app, createParams)
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
      const jobLabelSelector = `etherealengine/jobName=${jobBody.metadata!.name},etherealengine/release=${
        process.env.RELEASE_NAME
      },etherealengine/modelTransformer=true`
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
