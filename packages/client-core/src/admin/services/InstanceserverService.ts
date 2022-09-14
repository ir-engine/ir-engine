import { InstanceServerPatch } from '@xrengine/common/src/interfaces/Instance'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:InstanceserverService' })

//State
const AdminInstanceServerState = defineState({
  name: 'AdminInstanceServerState',
  initial: () => ({
    patch: undefined as undefined | InstanceServerPatch,
    fetched: false,
    lastFetched: Date.now()
  })
})

const patchInstanceserverReceptor = (action: typeof AdminInstanceserverActions.patchInstanceserver.matches._TYPE) => {
  const state = getState(AdminInstanceServerState)
  return state.merge({
    patch: undefined,
    fetched: false
  })
}

const patchedInstanceserverReceptor = (
  action: typeof AdminInstanceserverActions.patchedInstanceserver.matches._TYPE
) => {
  const state = getState(AdminInstanceServerState)
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

export const accessInstanceserverState = () => getState(AdminInstanceServerState)

export const useInstanceserverState = () => useState(accessInstanceserverState())

//Service
export const InstanceserverService = {
  patchInstanceserver: async (locationId) => {
    try {
      dispatchAction(AdminInstanceserverActions.patchInstanceserver({}))
      const patch = await API.instance.client.service('instanceserver-provision').patch({ locationId })
      dispatchAction(AdminInstanceserverActions.patchedInstanceserver({ patch }))
    } catch (error) {
      logger.error(error)
    }
  }
}

//Action
export class AdminInstanceserverActions {
  static patchInstanceserver = defineAction({
    type: 'xre.client.AdminInstanceserver.INSTANCESERVER_PATCH' as const
  })
  static patchedInstanceserver = defineAction({
    type: 'xre.client.AdminInstanceserver.INSTANCESERVER_PATCHED' as const,
    patch: matches.object as Validator<unknown, InstanceServerPatch>
  })
}
