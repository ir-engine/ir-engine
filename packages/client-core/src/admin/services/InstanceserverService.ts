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
