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
import { disallow, discardQuery, iff, isProvider } from 'feathers-hooks-common'

import {
  staticResourceDataSchema,
  staticResourcePatchSchema,
  staticResourcePath,
  staticResourceQuerySchema,
  staticResourceSchema
} from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import collectAnalytics from '@etherealengine/server-core/src/hooks/collect-analytics'
import verifyScope from '../../hooks/verify-scope'

import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import { Forbidden } from '@feathersjs/errors'
import { getValidator } from '@feathersjs/typebox'
import { HookContext } from '../../../declarations'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { StaticResourceService } from './static-resource.class'
import {
  staticResourceDataResolver,
  staticResourceExternalResolver,
  staticResourcePatchResolver,
  staticResourceQueryResolver,
  staticResourceResolver
} from './static-resource.resolvers'

const staticResourceValidator = getValidator(staticResourceSchema, dataValidator)
const staticResourceDataValidator = getValidator(staticResourceDataSchema, dataValidator)
const staticResourcePatchValidator = getValidator(staticResourcePatchSchema, dataValidator)
const staticResourceQueryValidator = getValidator(staticResourceQuerySchema, queryValidator)

/**
 * Ensure static-resource with the specified id exists and user is creator of the resource
 * @param context
 * @returns
 */
const ensureResource = async (context: HookContext<StaticResourceService>) => {
  const resource = await context.app.service(staticResourcePath).get(context.id!)

  if (!resource.userId) {
    if (context.params?.provider) await verifyScope('admin', 'admin')(context as any)
  } else if (context.params?.provider && resource.userId !== context.params?.user?.id)
    throw new Forbidden('You are not the creator of this resource')

  if (resource.key) {
    const storageProvider = getStorageProvider()
    await storageProvider.deleteResources([resource.key])
  }
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(staticResourceExternalResolver),
      schemaHooks.resolveResult(staticResourceResolver)
    ]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(staticResourceQueryValidator),
      schemaHooks.resolveQuery(staticResourceQueryResolver)
    ],
    find: [
      iff(isProvider('external'), verifyScope('static_resource', 'read')),
      discardQuery('action'),
      collectAnalytics()
    ],
    get: [disallow('external')],
    create: [
      iff(isProvider('external'), verifyScope('static_resource', 'write')),
      setLoggedinUserInBody('userId'),
      () => schemaHooks.validateData(staticResourceDataValidator),
      schemaHooks.resolveData(staticResourceDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('static_resource', 'write')),
      () => schemaHooks.validateData(staticResourcePatchValidator),
      schemaHooks.resolveData(staticResourcePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('static_resource', 'write')), ensureResource]
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
