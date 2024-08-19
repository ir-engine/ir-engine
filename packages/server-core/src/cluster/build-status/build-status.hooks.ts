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
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  buildStatusDataValidator,
  buildStatusPatchValidator,
  buildStatusQueryValidator
} from '@ir-engine/common/src/schemas/cluster/build-status.schema'

import verifyScope from '../../hooks/verify-scope'
import {
  buildStatusDataResolver,
  buildStatusExternalResolver,
  buildStatusPatchResolver,
  buildStatusQueryResolver,
  buildStatusResolver
} from './build-status.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(buildStatusExternalResolver), schemaHooks.resolveResult(buildStatusResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(buildStatusQueryValidator), schemaHooks.resolveQuery(buildStatusQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [iff(isProvider('external'), verifyScope('server', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(buildStatusDataValidator),
      schemaHooks.resolveData(buildStatusDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(buildStatusPatchValidator),
      schemaHooks.resolveData(buildStatusPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('server', 'read'))]
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
