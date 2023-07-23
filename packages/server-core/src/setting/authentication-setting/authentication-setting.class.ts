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

import type { Id, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'
import * as k8s from '@kubernetes/client-node'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import {
  AuthenticationSettingData,
  AuthenticationSettingPatch,
  authenticationSettingPath,
  AuthenticationSettingQuery,
  AuthenticationSettingType
} from '@etherealengine/engine/src/schemas/setting/authentication-setting.schema'
import { getState } from '@etherealengine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'
import { authenticationSettingSchemaToDb } from './authentication-setting.resolvers'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AuthenticationSettingParams extends KnexAdapterParams<AuthenticationSettingQuery> {
  user: UserInterface
}

/**
 * A class for AuthenticationSetting service
 */

export class AuthenticationSettingService<
  T = AuthenticationSettingType,
  ServiceParams extends Params = AuthenticationSettingParams
> extends KnexAdapter<
  AuthenticationSettingType,
  AuthenticationSettingData,
  AuthenticationSettingParams,
  AuthenticationSettingPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: AuthenticationSettingParams) {
    const auth = await super._find()
    const loggedInUser = params!.user
    const data = auth.data.map((el) => {
      if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
        return {
          id: el.id,
          entity: el.entity,
          service: el.service,
          authStrategies: el.authStrategies
        }

      const returned = {
        ...el,
        authStrategies: el.authStrategies,
        jwtOptions: el.jwtOptions,
        bearerToken: el.bearerToken,
        callback: el.callback,
        oauth: {
          ...el.oauth
        }
      }
      return returned
    })
    return {
      total: auth.total,
      limit: auth.limit,
      skip: auth.skip,
      data
    }
  }

  async get(id: Id, params?: AuthenticationSettingParams) {
    return super._get(id, params)
  }

  async patch(id: Id, data: AuthenticationSettingPatch, params?: AuthenticationSettingParams) {
    const authSettings = await this.app.service(authenticationSettingPath).get(id)

    if (typeof data.oauth === 'string') {
      data.oauth = JSON.parse(data.oauth)
    }

    let newOAuth = data.oauth!
    data.callback = authSettings.callback

    if (typeof data.callback === 'string') {
      data.callback = JSON.parse(data.callback)

      // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
      // was serialized multiple times, therefore we need to parse it twice.
      if (typeof data.callback === 'string') {
        data.callback = JSON.parse(data.callback)
      }
    }

    for (let key of Object.keys(newOAuth)) {
      if (config.authentication.oauth[key]?.scope) newOAuth[key].scope = config.authentication.oauth[key].scope
      if (config.authentication.oauth[key]?.custom_data)
        newOAuth[key].custom_data = config.authentication.oauth[key].custom_data
      if (key !== 'defaults' && data.callback && !data.callback[key])
        data.callback[key] = `${config.client.url}/auth/oauth/${key}`
    }

    const patchResult = await super._patch(id, authenticationSettingSchemaToDb(data) as any, params)

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
        return e
      }
    }

    return patchResult
  }
}
