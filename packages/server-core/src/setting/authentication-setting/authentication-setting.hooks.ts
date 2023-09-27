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

import {
  authenticationSettingDataValidator,
  authenticationSettingPatchValidator,
  authenticationSettingQueryValidator
} from '@etherealengine/engine/src/schemas/setting/authentication-setting.schema'
import { hooks as schemaHooks } from '@feathersjs/schema'
import * as k8s from '@kubernetes/client-node'
import { iff, isProvider } from 'feathers-hooks-common'

import { getState } from '@etherealengine/hyperflux'
import { HookContext } from '@feathersjs/feathers'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'
import config from '../../appconfig'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  authenticationSettingDataResolver,
  authenticationSettingExternalResolver,
  authenticationSettingPatchResolver,
  authenticationSettingQueryResolver,
  authenticationSettingResolver,
  authenticationSettingSchemaToDb
} from './authentication-setting.resolvers'

const findActionHook = async (context: HookContext) => {
  const auth = context.result
  const loggedInUser = context.params!.user!
  const data = auth.data.map((el) => {
    if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
      return {
        id: el.id,
        entity: el.entity,
        service: el.service,
        authStrategies: el.authStrategies,
        createdAt: el.createdAt,
        updatedAt: el.updatedAt
      }

    return {
      ...el,
      authStrategies: el.authStrategies,
      jwtOptions: el.jwtOptions,
      bearerToken: el.bearerToken,
      callback: el.callback,
      oauth: {
        ...el.oauth
      }
    }
  })
  context.result = { total: auth.total, limit: auth.limit, skip: auth.skip, data }
}

const beforePatchActionHook = async (context: HookContext) => {
  const authSettings = await context.service.get(context.id!)

  if (typeof context.data.oauth === 'string') {
    context.data.oauth = JSON.parse(context.data.oauth)
  }

  const newOAuth = context.data.oauth!
  context.data.callback = authSettings.callback

  if (typeof context.data.callback === 'string') {
    context.data.callback = JSON.parse(context.data.callback)

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof context.data.callback === 'string') {
      context.data.callback = JSON.parse(context.data.callback)
    }
  }

  for (const key of Object.keys(newOAuth)) {
    if (config.authentication.oauth[key]?.scope) newOAuth[key].scope = config.authentication.oauth[key].scope
    if (config.authentication.oauth[key]?.custom_data)
      newOAuth[key].custom_data = config.authentication.oauth[key].custom_data
    if (key !== 'defaults' && context.data.callback && !context.data.callback[key])
      context.data.callback[key] = `${config.client.url}/auth/oauth/${key}`
  }
  context.data = authenticationSettingSchemaToDb(context.data)
}

const afterPatchActionHook = async (context: HookContext) => {
  const patchResult = context.result

  const k8AppsClient = getState(ServerState).k8AppsClient

  if (k8AppsClient) {
    try {
      logger.info('Attempting to refresh API pods')
      const refreshApiPodResponse = await k8AppsClient.patchNamespacedDeployment(
        `${config.server.releaseName}-etherealengine-api`,
        'default',
        {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
              }
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            'Content-Type': k8s.PatchUtils.PATCH_FORMAT_STRATEGIC_MERGE_PATCH
          }
        }
      )
      logger.info(refreshApiPodResponse, 'updateBuilderTagResponse')
    } catch (e) {
      logger.error(e)
      context.result = e
    }
  }
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(authenticationSettingExternalResolver),
      schemaHooks.resolveResult(authenticationSettingResolver)
    ]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(authenticationSettingQueryValidator),
      schemaHooks.resolveQuery(authenticationSettingQueryResolver)
    ],
    find: [],
    get: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(authenticationSettingDataValidator),
      schemaHooks.resolveData(authenticationSettingDataResolver)
    ],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(authenticationSettingPatchValidator),
      schemaHooks.resolveData(authenticationSettingPatchResolver),
      beforePatchActionHook
    ],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))]
  },

  after: {
    all: [],
    find: [findActionHook],
    get: [],
    create: [],
    update: [],
    patch: [afterPatchActionHook],
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
