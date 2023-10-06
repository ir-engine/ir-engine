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

import _ from 'lodash'

import logger from '@etherealengine/engine/src/common/functions/logger'

import {
  ProjectPermissionType,
  projectPermissionPath
} from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import { ProjectType, projectMethods, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { ScopeType, scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { ProjectService } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [projectPath]: ProjectService
  }
}

export default (app: Application): void => {
  const options = {
    name: projectPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(projectPath, new ProjectService(options, app), {
    // A list of all methods this service exposes externally
    methods: projectMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectDocs
  })

  const service = app.service(projectPath)
  service.hooks(hooks)

  service.publish('patched', async (data: ProjectType) => {
    try {
      let targetIds: string[] = []
      const projectOwners = (await app.service(projectPermissionPath).find({
        query: {
          projectId: data.id
        },
        paginate: false
      })) as any as ProjectPermissionType[]
      targetIds = targetIds.concat(projectOwners.map((permission) => permission.userId))

      const adminScopes = (await app.service(scopePath).find({
        query: {
          type: 'admin:admin'
        },
        paginate: false
      })) as ScopeType[]

      targetIds = targetIds.concat(adminScopes.map((admin) => admin.userId!))
      targetIds = _.uniq(targetIds)
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
