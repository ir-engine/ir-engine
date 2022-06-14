import { InstanceServerPatch } from '@xrengine/common/src/interfaces/Instance'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { client } from '../../feathers'

//State
const AdminInstanceServerState = defineState({
  name: 'AdminInstanceServerState',
  initial: () => ({
    patch: undefined as undefined | InstanceServerPatch,
    fetched: false,
    lastFetched: Date.now()
  })
})

export const AdminInstanceServerServiceReceptor = (action) => {
  getState(AdminInstanceServerState).batch((s) => {
    matches(action)
      .when(InstanceserverAction.patchInstanceserver.matches, (action) => {
        return s.merge({
          patch: undefined,
          fetched: false
        })
      })
      .when(InstanceserverAction.patchedInstanceserver.matches, (action) => {
        return s.merge({
          patch: action.patch,
          fetched: true,
          lastFetched: Date.now()
        })
      })
  })
}

export const accessInstanceserverState = () => getState(AdminInstanceServerState)

export const useInstanceserverState = () => useState(accessInstanceserverState())

//Service
export const InstanceserverService = {
  patchInstanceserver: async (locationId) => {
    try {
      dispatchAction(InstanceserverAction.patchInstanceserver())
      const patch = await client.service('instanceserver-provision').patch({ locationId })
      dispatchAction(InstanceserverAction.patchedInstanceserver({ patch }))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export class InstanceserverAction {
  static patchInstanceserver = defineAction({
    type: 'INSTANCESERVER_PATCH' as const
  })
  static patchedInstanceserver = defineAction({
    type: 'INSTANCESERVER_PATCHED' as const,
    patch: matches.object as Validator<unknown, InstanceServerPatch>
  })
}
