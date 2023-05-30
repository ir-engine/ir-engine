import { LocationInstanceConnectionAction } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import logger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineAction, defineState, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

export type ActiveInstance = {
  id: string
  location: string
  currentUsers: number
  // todo: assignedAt so we can sort by most recent?
}

export const EditorActiveInstanceState = defineState({
  name: 'EditorActiveInstanceState',
  initial: () => ({
    activeInstances: [] as ActiveInstance[],
    fetching: false
  })
})

export const EditorActiveInstanceServiceReceptor = (action): any => {
  const state = getMutableState(EditorActiveInstanceState)
  matches(action)
    .when(EditorActiveInstanceAction.fetchingActiveInstances.matches, (action) => {
      return state.merge({ fetching: true })
    })
    .when(EditorActiveInstanceAction.fetchedActiveInstances.matches, (action) => {
      return state.merge({ activeInstances: action.activeInstances, fetching: false })
    })
}

//Service
export const EditorActiveInstanceService = {
  provisionServer: async (locationId: string, instanceId: string, sceneId: string) => {
    logger.info({ locationId, instanceId, sceneId }, 'Provision World Server Editor')
    const token = getState(AuthState).authUser.accessToken
    const provisionResult = await Engine.instance.api.service('instance-provision').find({
      query: {
        locationId: locationId,
        instanceId: instanceId,
        sceneId: sceneId,
        token: token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatchAction(
        LocationInstanceConnectionAction.serverProvisioned({
          instanceId: provisionResult.id as UserId,
          ipAddress: provisionResult.ipAddress,
          port: provisionResult.port,
          roomCode: provisionResult.roomCode,
          locationId: locationId!,
          sceneId: sceneId!
        })
      )
    }
  },
  getActiveInstances: async (sceneId: string) => {
    dispatchAction(EditorActiveInstanceAction.fetchingActiveInstances({}))
    const activeInstances = await Engine.instance.api.service('instances-active').find({
      query: { sceneId }
    })
    dispatchAction(EditorActiveInstanceAction.fetchedActiveInstances({ activeInstances }))
  }
}

//Action
export class EditorActiveInstanceAction {
  static fetchingActiveInstances = defineAction({
    type: 'ee.editor.EditorActiveInstance.FETCHING_ACTIVE_INSTANCES' as const
  })

  static fetchedActiveInstances = defineAction({
    type: 'ee.editor.EditorActiveInstance.FETCHED_ACTIVE_INSTANCES' as const,
    activeInstances: matches.array as Validator<unknown, ActiveInstance[]>
  })
}
