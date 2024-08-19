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

import { ServiceInterface } from '@feathersjs/feathers'

import { BuilderInfoType } from '@ir-engine/common/src/schemas/projects/builder-info.schema'
import { getState } from '@ir-engine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { ServerState } from '../../ServerState'
import { dockerHubRegex, engineVersion, privateECRTagRegex, publicECRTagRegex } from '../project/project-helper'

export class BuilderInfoService implements ServiceInterface<BuilderInfoType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get() {
    const returned: BuilderInfoType = {
      engineVersion: engineVersion || '',
      engineCommit: ''
    }
    const k8AppsClient = getState(ServerState).k8AppsClient
    const k8BatchClient = getState(ServerState).k8BatchClient

    if (k8AppsClient) {
      const builderLabelSelector = `app.kubernetes.io/instance=${config.server.releaseName}-builder`

      const builderJob = await k8BatchClient.listNamespacedJob(
        'default',
        undefined,
        false,
        undefined,
        undefined,
        builderLabelSelector
      )

      let builderContainer
      if (builderJob && builderJob.body.items.length > 0) {
        builderContainer = builderJob?.body?.items[0]?.spec?.template?.spec?.containers?.find(
          (container) => container.name === 'ir-engine-builder'
        )
      } else {
        const builderDeployment = await k8AppsClient.listNamespacedDeployment(
          'default',
          'false',
          false,
          undefined,
          undefined,
          builderLabelSelector
        )
        builderContainer = builderDeployment?.body?.items[0]?.spec?.template?.spec?.containers?.find(
          (container) => container.name === 'ir-engine-builder'
        )
      }
      if (builderContainer) {
        const image = builderContainer.image
        if (image && typeof image === 'string') {
          const dockerHubRegexExec = dockerHubRegex.exec(image)
          const publicECRRegexExec = publicECRTagRegex.exec(image)
          const privateECRRegexExec = privateECRTagRegex.exec(image)
          returned.engineCommit =
            dockerHubRegexExec && !publicECRRegexExec
              ? dockerHubRegexExec[1]
              : publicECRRegexExec
              ? publicECRRegexExec[1]
              : privateECRRegexExec
              ? privateECRRegexExec[2]
              : ''
        }
      }
    }
    return returned
  }
}
