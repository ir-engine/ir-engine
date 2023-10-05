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

import { Paginated, Params } from '@feathersjs/feathers'

import { KnexService } from '@feathersjs/knex'

import {
  ProjectPermissionData,
  ProjectPermissionPatch,
  ProjectPermissionQuery,
  ProjectPermissionType
} from '@etherealengine/engine/src/schemas/projects/project-permission.schema'

import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectPermissionParams extends RootParams<ProjectPermissionQuery> {}

/**
 * A class for ProjectPermission service
 */

export class ProjectPermissionService<
  T = ProjectPermissionType,
  ServiceParams extends Params = ProjectPermissionParams
> extends KnexService<ProjectPermissionType, ProjectPermissionData, ProjectPermissionParams, ProjectPermissionPatch> {
  async makeRandomProjectOwnerIfNone(projectId) {
    const projectOwners = (await super.find({
      query: {
        projectId: projectId,
        type: 'owner'
      },
      paginate: false
    })) as any as ProjectPermissionType[]

    if (projectOwners.length === 0) {
      const newOwner = (await super.find({
        query: {
          projectId: projectId,
          $limit: 1
        }
      })) as Paginated<ProjectPermissionType>
      if (newOwner.data.length > 0)
        await super.patch(newOwner.data[0].id, {
          type: 'owner'
        })
    }
  }
}
