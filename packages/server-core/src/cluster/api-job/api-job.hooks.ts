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
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  apiJobDataSchema,
  apiJobPatchSchema,
  apiJobQuerySchema,
  apiJobSchema
} from '@etherealengine/engine/src/schemas/cluster/api-job.schema'

import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import { getValidator } from '@feathersjs/typebox'
import verifyScope from '../../hooks/verify-scope'
import {
  apiJobDataResolver,
  apiJobExternalResolver,
  apiJobPatchResolver,
  apiJobQueryResolver,
  apiJobResolver
} from './api-job.resolvers'

const apiJobValidator = getValidator(apiJobSchema, dataValidator)
const apiJobDataValidator = getValidator(apiJobDataSchema, dataValidator)
const apiJobPatchValidator = getValidator(apiJobPatchSchema, dataValidator)
const apiJobQueryValidator = getValidator(apiJobQuerySchema, queryValidator)

export default {
  around: {
    all: [schemaHooks.resolveExternal(apiJobExternalResolver), schemaHooks.resolveResult(apiJobResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(apiJobQueryValidator), schemaHooks.resolveQuery(apiJobQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [iff(isProvider('external'), verifyScope('server', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      () => schemaHooks.validateData(apiJobDataValidator),
      schemaHooks.resolveData(apiJobDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      () => schemaHooks.validateData(apiJobPatchValidator),
      schemaHooks.resolveData(apiJobPatchResolver)
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
