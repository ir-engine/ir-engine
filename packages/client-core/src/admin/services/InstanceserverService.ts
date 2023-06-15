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

import { InstanceServerPatch } from '@etherealengine/common/src/interfaces/Instance'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:InstanceserverService' })

//State
export const AdminInstanceServerState = defineState({
  name: 'AdminInstanceServerState',
  initial: () => ({
    patch: undefined as undefined | InstanceServerPatch,
    fetched: false,
    lastFetched: Date.now()
  })
})

const patchInstanceserverReceptor = (action: typeof AdminInstanceserverActions.patchInstanceserver.matches._TYPE) => {
  const state = getMutableState(AdminInstanceServerState)
  return state.merge({
    patch: undefined,
    fetched: false
  })
}

const patchedInstanceserverReceptor = (
  action: typeof AdminInstanceserverActions.patchedInstanceserver.matches._TYPE
) => {
  const state = getMutableState(AdminInstanceServerState)
  return state.merge({
    patch: action.patch,
    fetched: true,
    lastFetched: Date.now()
  })
}

export const InstanceServerSettingReceptors = {
  patchInstanceserverReceptor,
  patchedInstanceserverReceptor
}

//Service
export const InstanceserverService = {
  patchInstanceserver: async (locationId: string, count: number) => {
    try {
      dispatchAction(AdminInstanceserverActions.patchInstanceserver({}))
      const patch = await API.instance.client.service('instanceserver-provision').patch({ locationId, count })
      dispatchAction(AdminInstanceserverActions.patchedInstanceserver({ patch }))
    } catch (error) {
      logger.error(error)
    }
  }
}

//Action
export class AdminInstanceserverActions {
  static patchInstanceserver = defineAction({
    type: 'ee.client.AdminInstanceserver.INSTANCESERVER_PATCH' as const
  })
  static patchedInstanceserver = defineAction({
    type: 'ee.client.AdminInstanceserver.INSTANCESERVER_PATCHED' as const,
    patch: matches.object as Validator<unknown, InstanceServerPatch>
  })
}
