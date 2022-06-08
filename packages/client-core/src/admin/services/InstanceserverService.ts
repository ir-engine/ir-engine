import { createState, useState } from '@speigg/hookstate'

import { InstanceServerPatch } from '@xrengine/common/src/interfaces/Instance'

import { client } from '../../feathers'
import { useDispatch } from '../../store'
import { store } from '../../store'

//State
const state = createState({
  patch: undefined as undefined | InstanceServerPatch,
  fetched: false,
  lastFetched: Date.now()
})

store.receptors.push((action: InstanceserverActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'INSTANCESERVER_PATCH':
        return s.merge({
          patch: undefined,
          fetched: false
        })
      case 'INSTANCESERVER_PATCHED':
        return s.merge({
          patch: action.patch,
          fetched: true,
          lastFetched: Date.now()
        })
    }
  }, action.type)
})

export const accessInstanceserverState = () => state

export const useInstanceserverState = () => useState(state) as any as typeof state

//Service
export const InstanceserverService = {
  patchInstanceserver: async (locationId) => {
    const dispatch = useDispatch()
    try {
      dispatch(InstanceserverAction.patchInstanceserver())
      const patch = await client.service('instanceserver-provision').patch({ locationId })
      dispatch(InstanceserverAction.patchedInstanceserver(patch))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const InstanceserverAction = {
  patchInstanceserver: () => {
    return {
      type: 'INSTANCESERVER_PATCH' as const
    }
  },
  patchedInstanceserver: (patch: InstanceServerPatch) => {
    return {
      type: 'INSTANCESERVER_PATCHED' as const,
      patch
    }
  }
}

export type InstanceserverActionType = ReturnType<typeof InstanceserverAction[keyof typeof InstanceserverAction]>
