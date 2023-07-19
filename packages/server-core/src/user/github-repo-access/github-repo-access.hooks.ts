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
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  githubRepoAccessDataSchema,
  githubRepoAccessPatchSchema,
  githubRepoAccessQuerySchema,
  githubRepoAccessSchema
} from '@etherealengine/engine/src/schemas/user/github-repo-access.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  githubRepoAccessDataResolver,
  githubRepoAccessExternalResolver,
  githubRepoAccessPatchResolver,
  githubRepoAccessQueryResolver,
  githubRepoAccessResolver
} from './github-repo-access.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const githubRepoAccessValidator = getValidator(githubRepoAccessSchema, dataValidator)
const githubRepoAccessDataValidator = getValidator(githubRepoAccessDataSchema, dataValidator)
const githubRepoAccessPatchValidator = getValidator(githubRepoAccessPatchSchema, dataValidator)
const githubRepoAccessQueryValidator = getValidator(githubRepoAccessQuerySchema, queryValidator)

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(githubRepoAccessExternalResolver),
      schemaHooks.resolveResult(githubRepoAccessResolver)
    ]
  },

  before: {
    all: [
      iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin')),
      () => schemaHooks.validateQuery(githubRepoAccessQueryValidator),
      schemaHooks.resolveQuery(githubRepoAccessQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      () => schemaHooks.validateData(githubRepoAccessDataValidator),
      schemaHooks.resolveData(githubRepoAccessDataResolver)
    ],
    update: [],
    patch: [
      () => schemaHooks.validateData(githubRepoAccessPatchValidator),
      schemaHooks.resolveData(githubRepoAccessPatchResolver)
    ],
    remove: []
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
