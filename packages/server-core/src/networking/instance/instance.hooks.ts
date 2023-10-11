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

import { HookContext, NextFunction } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'

import {
  instanceDataValidator,
  instancePatchValidator,
  instanceQueryValidator
} from '@etherealengine/engine/src/schemas/networking/instance.schema'
import {
  instanceDataResolver,
  instanceExternalResolver,
  instancePatchResolver,
  instanceQueryResolver,
  instanceResolver
} from './instance.resolvers'

const applyLocationNameSort = async (context: HookContext, next: NextFunction) => {
  await next() // Read more about execution of hooks: https://github.com/feathersjs/hooks#flow-control-with-multiple-hooks

  const hasLocationNameSort =
    context.params.query && context.params.query.$sort && context.params.query.$sort['locationName']

  if (hasLocationNameSort) {
    const { dispatch } = context
    const data = dispatch.data ? dispatch.data : dispatch

    data.sort((a, b) => {
      let fa = a['locationName'],
        fb = b['locationName']

      if (typeof fa === 'string') {
        fa = fa.toLowerCase()
        fb = fb.toLowerCase()
      }

      if (fa < fb) {
        return -1
      }
      if (fa > fb) {
        return 1
      }
      return 0
    })

    if (context.params.query.$sort['locationName'] === 1) {
      data.reverse()
    }
  }
}

export default {
  around: {
    all: [
      applyLocationNameSort,
      schemaHooks.resolveExternal(instanceExternalResolver),
      schemaHooks.resolveResult(instanceResolver)
    ]
  },

  before: {
    all: [() => schemaHooks.validateQuery(instanceQueryValidator), schemaHooks.resolveQuery(instanceQueryResolver)],
    find: [],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateData(instanceDataValidator),
      schemaHooks.resolveData(instanceDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateData(instancePatchValidator),
      schemaHooks.resolveData(instancePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin'))]
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
