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

import { Paginated, Params } from '@feathersjs/feathers'
import * as k8s from '@kubernetes/client-node'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminAuthSetting as AdminAuthSettingInterface } from '@etherealengine/common/src/interfaces/AdminAuthSetting'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { getState } from '@etherealengine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'
import { UserParams } from '../../user/user/user.class'

export type AdminAuthSettingDataType = AdminAuthSettingInterface

export class Authentication<T = AdminAuthSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    const auth = (await super.find()) as any
    const loggedInUser = params!.user as UserInterface
    const data = auth.data.map((el) => {
      let oauth = JSON.parse(el.oauth)
      let authStrategies = JSON.parse(el.authStrategies)
      let jwtOptions = JSON.parse(el.jwtOptions)
      let bearerToken = JSON.parse(el.bearerToken)
      let callback = JSON.parse(el.callback)

      if (typeof oauth === 'string') oauth = JSON.parse(oauth)
      if (typeof authStrategies === 'string') authStrategies = JSON.parse(authStrategies)
      if (typeof jwtOptions === 'string') jwtOptions = JSON.parse(jwtOptions)
      if (typeof bearerToken === 'string') bearerToken = JSON.parse(bearerToken)
      if (typeof callback === 'string') callback = JSON.parse(callback)

      if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
        return {
          id: el.id,
          entity: el.entity,
          service: el.service,
          authStrategies: authStrategies
        }

      const returned = {
        ...el,
        authStrategies: authStrategies,
        jwtOptions: jwtOptions,
        bearerToken: bearerToken,
        callback: callback,
        oauth: {
          ...oauth
        }
      }
      if (oauth.defaults) returned.oauth.defaults = JSON.parse(oauth.defaults)
      if (oauth.discord) returned.oauth.discord = JSON.parse(oauth.discord)
      if (oauth.facebook) returned.oauth.facebook = JSON.parse(oauth.facebook)
      if (oauth.github) returned.oauth.github = JSON.parse(oauth.github)
      if (oauth.google) returned.oauth.google = JSON.parse(oauth.google)
      if (oauth.linkedin) returned.oauth.linkedin = JSON.parse(oauth.linkedin)
      if (oauth.twitter) returned.oauth.twitter = JSON.parse(oauth.twitter)
      return returned
    })
    return {
      total: auth.total,
      limit: auth.limit,
      skip: auth.skip,
      data
    }
  }

  async patch(id: string, data: any, params?: Params): Promise<T[] | T> {
    const authSettings = await this.app.service('authentication-setting').get(id)
    let existingCallback = JSON.parse(authSettings.callback as any)
    if (typeof existingCallback === 'string') existingCallback = JSON.parse(existingCallback)

    let newOAuth = JSON.parse(data.oauth)
    data.callback = existingCallback

    for (let key of Object.keys(newOAuth)) {
      newOAuth[key] = JSON.parse(newOAuth[key])
      if (config.authentication.oauth[key]?.scope) newOAuth[key].scope = config.authentication.oauth[key].scope
      if (config.authentication.oauth[key]?.custom_data)
        newOAuth[key].custom_data = config.authentication.oauth[key].custom_data
      if (key !== 'defaults' && !data.callback[key]) data.callback[key] = `${config.client.url}/auth/oauth/${key}`
      newOAuth[key] = JSON.stringify(newOAuth[key])
    }

    data.oauth = JSON.stringify(newOAuth)
    data.callback = JSON.stringify(data.callback)

    const patchResult = await super.patch(id, data, params)

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
