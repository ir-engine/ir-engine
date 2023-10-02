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

import {
  recordingDataValidator,
  recordingPatchValidator,
  recordingQueryValidator
} from '@etherealengine/engine/src/schemas/recording/recording.schema'

import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import { NotFound } from '@feathersjs/errors'
import { HookContext, NextFunction } from '@feathersjs/feathers'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  recordingDataResolver,
  recordingExternalResolver,
  recordingPatchResolver,
  recordingQueryResolver,
  recordingResolver
} from './recording.resolvers'

const applyUserNameSort = async (context: HookContext, next: NextFunction) => {
  await next() // Read more about execution of hooks: https://github.com/feathersjs/hooks#flow-control-with-multiple-hooks

  const hasUserNameSort = context.params.query && context.params.query.$sort && context.params.query.$sort['user']

  if (hasUserNameSort) {
    const { dispatch } = context
    const data = dispatch.data ? dispatch.data : dispatch

    data.sort((a, b) => {
      let fa = a['user'],
        fb = b['user']

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

    if (context.params.query.$sort['user'] === 1) {
      data.reverse()
    }
  }
}

const findActionHook = async (context: HookContext) => {
  let paramsWithoutExtras = {
    ...context.params,
    // Explicitly cloned sort object because otherwise it was affecting default params object as well.
    query: context.params?.query ? JSON.parse(JSON.stringify(context.params?.query)) : {}
  }
  paramsWithoutExtras = {
    ...paramsWithoutExtras,
    query: { ...paramsWithoutExtras.query, userId: context.params?.user?.id }
  }

  if (context.params && context.params.user && context.params.query) {
    const admin = await checkScope(context.params.user, 'admin', 'admin')
    if (admin && context.params.query.action === 'admin') {
      // show admin page results only if user is admin and query.action explicitly is admin (indicates admin panel)
      if (paramsWithoutExtras.query?.userId || paramsWithoutExtras.query?.userId === '')
        delete paramsWithoutExtras.query.userId
    }
  }

  // Remove recording username sort
  if (paramsWithoutExtras.query?.$sort && paramsWithoutExtras.query?.$sort['user']) {
    delete paramsWithoutExtras.query.$sort['user']
  }

  // Remove extra params
  if (paramsWithoutExtras.query?.action || paramsWithoutExtras.query?.action === '')
    delete paramsWithoutExtras.query.action

  context.params = paramsWithoutExtras
}

const createActionHook = async (context: HookContext) => {
  context.data = {
    ...context.data,
    userId: context.params?.user?.id
  }
}

const removeActionHook = async (context: HookContext) => {
  const recording = context.service._get(context.id)
  if (!recording) {
    throw new NotFound('Unable to find recording with this id')
  }
}

export default {
  around: {
    all: [
      applyUserNameSort,
      schemaHooks.resolveExternal(recordingExternalResolver),
      schemaHooks.resolveResult(recordingResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(recordingQueryValidator),
      schemaHooks.resolveQuery(recordingQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyScope('recording', 'read')), findActionHook],
    get: [iff(isProvider('external'), verifyScope('recording', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('recording', 'write')),
      () => schemaHooks.validateData(recordingDataValidator),
      schemaHooks.resolveData(recordingDataResolver),
      createActionHook
    ],
    update: [iff(isProvider('external'), verifyScope('recording', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('recording', 'write')),
      () => schemaHooks.validateData(recordingPatchValidator),
      schemaHooks.resolveData(recordingPatchResolver)
    ],
    remove: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('recording', 'write')),
      removeActionHook
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
