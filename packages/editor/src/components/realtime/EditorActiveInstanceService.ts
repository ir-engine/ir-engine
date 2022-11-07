import { useEffect } from 'react'

import { API } from '@xrengine/client-core/src/API'
import { LocationInstanceConnectionAction } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import logger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { accessEditorState } from '../../services/EditorServices'

export type ActiveInstance = {
  id: string
  location: string
  // todo: assignedAt so we can sort by most recent?
}

const EditorActiveInstanceState = defineState({
  name: 'EditorActiveInstanceState',
  initial: () => ({
    activeInstances: [] as ActiveInstance[],
    fetching: false
  })
})

export const EditorActiveInstanceServiceReceptor = (action): any => {
  const state = getState(EditorActiveInstanceState)
  matches(action)
    .when(EditorActiveInstanceAction.fetchingActiveInstances.matches, (action) => {
      return state.merge({ fetching: true })
    })
    .when(EditorActiveInstanceAction.fetchedActiveInstances.matches, (action) => {
      return state.merge({ activeInstances: action.activeInstances, fetching: false })
    })
}

export const accessEditorActiveInstanceState = () => getState(EditorActiveInstanceState)

export const useEditorActiveInstanceState = () => useState(accessEditorActiveInstanceState())

//Service
export const EditorActiveInstanceService = {
  provisionServer: async (locationId: string, instanceId: string, sceneId: string) => {
    logger.info({ locationId, instanceId, sceneId }, 'Provision World Server Editor')
    const token = accessAuthState().authUser.accessToken.value
    const provisionResult = await API.instance.client.service('instance-provision').find({
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
    const activeInstances = await API.instance.client.service('instances-active').find({
      query: { sceneId }
    })
    dispatchAction(EditorActiveInstanceAction.fetchedActiveInstances({ activeInstances }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const editorState = accessEditorState()
      const sceneId = `${editorState.projectName.value}/${editorState.sceneName.value}`
      EditorActiveInstanceService.getActiveInstances(sceneId)
      const timer = setInterval(() => {
        const editorState = accessEditorState()
        const sceneId = `${editorState.projectName.value}/${editorState.sceneName.value}`
        EditorActiveInstanceService.getActiveInstances(sceneId)
      }, 5000)
      return () => {
        clearTimeout(timer)
      }
    }, [])
  }
}

//Action
export class EditorActiveInstanceAction {
  static fetchingActiveInstances = defineAction({
    type: 'xre.editor.EditorActiveInstance.FETCHING_ACTIVE_INSTANCES' as const
  })

  static fetchedActiveInstances = defineAction({
    type: 'xre.editor.EditorActiveInstance.FETCHED_ACTIVE_INSTANCES' as const,
    activeInstances: matches.array as Validator<unknown, ActiveInstance[]>
  })
}
