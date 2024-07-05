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

import {
  StaticResourceType,
  staticResourceMethods,
  staticResourcePath
} from '@etherealengine/common/src/schemas/media/static-resource.schema'

import {
  ScopeData,
  ScopeType,
  ScopeTypeInterface,
  UserID,
  projectPath,
  projectPermissionPath,
  scopePath
} from '@etherealengine/common/src/schema.type.module'
import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import _ from 'lodash'
import { Application } from '../../../declarations'
import { StaticResourceService } from './static-resource.class'
import staticResourceDocs from './static-resource.docs'
import hooks from './static-resource.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [staticResourcePath]: StaticResourceService
  }
}

export default (app: Application): void => {
  const options = {
    name: staticResourcePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(staticResourcePath, new StaticResourceService(options), {
    // A list of all methods this service exposes externally
    methods: staticResourceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: staticResourceDocs
  })

  const service = app.service(staticResourcePath)
  service.hooks(hooks)

  const onCRUD =
    (app: Application) => async (data: StaticResourceType | Paginated<StaticResourceType> | StaticResourceType[]) => {
      let userWithProjectReadScopes: (ScopeTypeInterface | ScopeData)[] = []

      const process = async (item: StaticResourceType) => {
        // Only allow project scenes to be processed further
        if (!item.project || item.type !== 'scene') {
          return
        }

        // Populate user with project read scopes array if its not already populated
        if (userWithProjectReadScopes.length === 0) {
          userWithProjectReadScopes = await app.service(scopePath).find({
            query: {
              type: 'projects:read' as ScopeType
            },
            paginate: false
          })
        }

        const project = await app.service(projectPath).find({
          query: {
            name: item.project,
            $select: ['id'],
            $limit: 1
          },
          paginate: false
        })

        if (project.length === 0) {
          throw new BadRequest(`Project not found. ${item.project}`)
        }

        const projectOwners = await app.service(projectPermissionPath).find({
          query: {
            projectId: project[0].id,
            type: 'owner'
          },
          paginate: false
        })

        const targetIds: string[] = []

        projectOwners.forEach((permission) => {
          targetIds.push(permission.userId)
        })

        userWithProjectReadScopes.forEach((scope) => {
          targetIds.push(scope.userId)
        })

        const uniqueUserIds = _.uniq(targetIds)
        return Promise.all(uniqueUserIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(item)))
      }

      if (Array.isArray(data)) {
        await Promise.all(data.map(process))
      } else if ('data' in data) {
        await Promise.all(data.data.map(process))
      } else {
        await process(data)
      }
    }

  service.publish('created', onCRUD(app))
  service.publish('patched', onCRUD(app))
  service.publish('updated', onCRUD(app))
  service.publish('removed', onCRUD(app))
}
