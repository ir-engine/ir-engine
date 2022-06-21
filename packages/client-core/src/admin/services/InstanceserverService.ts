import { InstanceServerPatch } from '@xrengine/common/src/interfaces/Instance'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

//State
const AdminInstanceServerState = defineState({
  name: 'AdminInstanceServerState',
  initial: () => ({
    patch: undefined as undefined | InstanceServerPatch,
    fetched: false,
    lastFetched: Date.now()
  })
})

const patchInstanceserverReceptor = (action: typeof InstanceserverActions.patchInstanceserver.matches._TYPE) => {
  const state = getState(AdminInstanceServerState)
  return state.merge({
    patch: undefined,
    fetched: false
  })
}

const patchedInstanceserverReceptor = (action: typeof InstanceserverActions.patchedInstanceserver.matches._TYPE) => {
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
      dispatchAction(InstanceserverActions.patchInstanceserver())
      const patch = await API.instance.client.service('instanceserver-provision').patch({ locationId })
      dispatchAction(InstanceserverActions.patchedInstanceserver({ patch }))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export class InstanceserverActions {
  static patchInstanceserver = defineAction({
    type: 'INSTANCESERVER_PATCH' as const
  })
  static patchedInstanceserver = defineAction({
    type: 'INSTANCESERVER_PATCHED' as const,
    patch: matches.object as Validator<unknown, InstanceServerPatch>
  })
}
