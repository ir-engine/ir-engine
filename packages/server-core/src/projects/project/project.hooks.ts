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
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import { projectPermissionPath } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import {
  projectDataValidator,
  projectPatchValidator,
  projectQueryValidator
} from '@etherealengine/engine/src/schemas/projects/project.schema'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'
import { projectPermissionDataResolver } from '../project-permission/project-permission.resolvers'

import { HookContext } from '@feathersjs/feathers'
import {
  projectDataResolver,
  projectExternalResolver,
  projectPatchResolver,
  projectQueryResolver,
  projectResolver
} from './project.resolvers'

const createProjectPermission = async (context: HookContext) => {
  if (context.params?.user?.id) {
    const projectPermissionData = await projectPermissionDataResolver.resolve(
      {
        userId: context.params.user.id,
        projectId: context.result.id,
        type: 'owner'
      },
      context as any
    )
    return context.app.service(projectPermissionPath).create(projectPermissionData)
  }
  return context
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(projectExternalResolver), schemaHooks.resolveResult(projectResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(projectQueryValidator), schemaHooks.resolveQuery(projectQueryResolver)],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      () => schemaHooks.validateData(projectDataValidator),
      schemaHooks.resolveData(projectDataResolver)
    ],
    update: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      projectPermissionAuthenticate(false),
      () => schemaHooks.validateData(projectPatchValidator)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      projectPermissionAuthenticate(false),
      () => schemaHooks.validateData(projectPatchValidator),
      schemaHooks.resolveData(projectPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('editor', 'write')), projectPermissionAuthenticate(false)]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createProjectPermission],
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
