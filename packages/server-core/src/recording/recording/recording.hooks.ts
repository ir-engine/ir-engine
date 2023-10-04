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
import { discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  recordingDataValidator,
  recordingPatchValidator,
  recordingPath,
  recordingQueryValidator
} from '@etherealengine/engine/src/schemas/recording/recording.schema'

import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import authenticate from '../../hooks/authenticate'
import isAction from '../../hooks/is-action'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'
import verifyScope from '../../hooks/verify-scope'
import {
  recordingDataResolver,
  recordingExternalResolver,
  recordingPatchResolver,
  recordingQueryResolver,
  recordingResolver
} from './recording.resolvers'

const sortByUserName = async (context: HookContext) => {
  if (context.params.query?.$sort?.['user']) {
    const sort = context.params.query.$sort['user']
    delete context.params.query.$sort['user']

    const query = context.service.createQuery(context.params)

    query.join(userPath, `${userPath}.id`, `${recordingPath}.userId`)
    query.orderBy(`${userPath}.name`, sort === 1 ? 'asc' : 'desc')
    query.select(`${recordingPath}.*`)

    context.params.knex = query
  }
}

const ensureRecording = async (context: HookContext) => {
  const recording = context.app.service(recordingPath).get(context.id!)
  if (!recording) {
    throw new NotFound('Unable to find recording with this id')
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(recordingExternalResolver), schemaHooks.resolveResult(recordingResolver)]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(recordingQueryValidator),
      schemaHooks.resolveQuery(recordingQueryResolver)
    ],
    find: [
      iff(isProvider('external'), verifyScope('recording', 'read')),
      iff(
        isProvider('external'),
        iffElse(isAction('admin'), verifyScope('admin', 'admin'), setLoggedinUserInQuery('userId'))
      ),
      discardQuery('action'),
      sortByUserName
    ],
    get: [iff(isProvider('external'), verifyScope('recording', 'read'))],
    create: [
      setLoggedinUserInBody('userId'),
      iff(isProvider('external'), verifyScope('recording', 'write')),
      () => schemaHooks.validateData(recordingDataValidator),
      schemaHooks.resolveData(recordingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('recording', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('recording', 'write')),
      () => schemaHooks.validateData(recordingPatchValidator),
      schemaHooks.resolveData(recordingPatchResolver)
    ],
    remove: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('recording', 'write')),
      ensureRecording
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
