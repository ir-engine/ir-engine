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

import { hooks as schemaHooks } from '@feathersjs/schema'
import setLoggedInUserInData from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  projectSettingDataValidator,
  projectSettingPatchValidator,
  projectSettingPath,
  projectSettingQueryValidator
} from '@ir-engine/common/src/schemas/setting/project-setting.schema'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { HookContext } from '../../../declarations'
import checkProjectPermission from '../../hooks/check-project-permission'
import checkScope from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import makeQueryJoinable from '../../hooks/make-query-joinable'
import setInContext from '../../hooks/set-in-context'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import {
  projectSettingDataResolver,
  projectSettingExternalResolver,
  projectSettingPatchResolver,
  projectSettingQueryResolver,
  projectSettingResolver
} from './project-setting.resolvers'

/**
 * Hook used to handle project name in find query.
 * @param context
 * @returns
 */
export const handleProjectName = async (context: HookContext) => {
  const projectName = context.params.query?.projectName

  if (!projectName) return context

  discardQuery('projectName')(context)

  await makeQueryJoinable(projectSettingPath)(context)

  const query = context.service.createQuery(context.params)

  query.join(projectPath, `${projectPath}.id`, '=', `${projectSettingPath}.projectId`)
  query.where(`${projectPath}.name`, '=', projectName)

  context.params.knex = query
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectSettingExternalResolver),
      schemaHooks.resolveResult(projectSettingResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectSettingQueryValidator),
      schemaHooks.resolveQuery(projectSettingQueryResolver)
    ],
    find: [
      iff(isProvider('external'), enableClientPagination()),
      iff(
        isProvider('external'),
        iffElse(
          checkScope('projects', 'read'),
          [],
          [iffElse(checkProjectPermission(['owner', 'editor']), [], setInContext('type', 'public')) as any]
        )
      ),
      handleProjectName
    ],
    get: [],
    create: [
      setLoggedInUserInData('userId'),
      schemaHooks.validateData(projectSettingDataValidator),
      schemaHooks.resolveData(projectSettingDataResolver),
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'write'), [], [verifyProjectPermission(['owner', 'editor'])])
      )
    ],
    patch: [
      setLoggedInUserInData('userId'),
      schemaHooks.validateData(projectSettingPatchValidator),
      schemaHooks.resolveData(projectSettingPatchResolver),
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'write'), [], [verifyProjectPermission(['owner', 'editor'])])
      )
    ],
    update: [],
    remove: [
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'write'), [], [verifyProjectPermission(['owner', 'editor'])])
      )
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
