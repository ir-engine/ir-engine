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

import { Paginated } from '@feathersjs/feathers'

// import config from '@etherealengine/common/src/config'
import multiLogger from '@etherealengine/common/src/logger'
import {
  MiddlewareApiType,
  MiddlewareSettingApiPatch,
  MiddlewareSettingPatch,
  MiddlewareSettingType,
  middlewareApiUrl,
  middlewareSettingPath
} from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../../common/services/NotificationService'
import waitForClientAuthenticated from '../../../util/wait-for-client-authenticated'

const logger = multiLogger.child({ component: 'client-core:MiddlewareSettingService' })

console.log('##### MiddlewareSettingService')

export const AdminMiddlewareSettingsState = defineState({
  name: 'AdminMiddlewareSettingsState',
  initial: () => ({
    middleware: [] as Array<MiddlewareSettingType>,
    updateNeeded: true
  })
})

// Middleware API
export const AdminMiddlewareApiState = defineState({
  name: 'AdminMiddlewareApiState',
  initial: () => ({
    middleware: [] as Array<MiddlewareApiType>,
    updateNeeded: true
  })
})

export const MiddlewareSettingService = {
  fetchMiddlewareSettings: async () => {
    try {
      await waitForClientAuthenticated()
      const middlewareSettings = (await Engine.instance.api
        .service(middlewareSettingPath)
        .find()) as Paginated<MiddlewareSettingType>

      console.log('middlewareSettings', middlewareSettings)

      // if (middlewareSettings.data[0].key8thWall) {
      //   config.middleware.key8thWall = middlewareSettings.data[0].key8thWall
      // }

      getMutableState(AdminMiddlewareSettingsState).merge({ middleware: middlewareSettings.data, updateNeeded: false })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchMiddlewareSetting: async (data: MiddlewareSettingPatch, id: string) => {
    try {
      await Engine.instance.api.service(middlewareSettingPath).patch(id, data)
      getMutableState(AdminMiddlewareSettingsState).merge({ updateNeeded: true })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

// Middleware API
export const MiddlewareApiService = {
  fetchMiddlewareApi: async () => {
    try {
      await waitForClientAuthenticated()
      const middlewareApi = (await Engine.instance.api.service(middlewareApiUrl).find()) as Paginated<MiddlewareApiType>

      console.log('middlewareApi', middlewareApi)

      // if (middlewareSettings.data[0].key8thWall) {
      //   config.middleware.key8thWall = middlewareSettings.data[0].key8thWall
      // }

      getMutableState(AdminMiddlewareApiState).merge({ middleware: middlewareApi.data, updateNeeded: false })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  patchMiddlewareSetting: async (data: MiddlewareSettingApiPatch, id: string) => {
    try {
      await Engine.instance.api.service(middlewareApiUrl).patch(id, data)
      getMutableState(AdminMiddlewareApiState).merge({ updateNeeded: true })
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
