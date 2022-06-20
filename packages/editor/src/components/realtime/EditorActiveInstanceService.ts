import { useState } from '@speigg/hookstate'

import { client } from '@xrengine/client-core/src/feathers'
import { InstanceInterface } from '@xrengine/common/src/dbmodels/Instance'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState
} from '@xrengine/hyperflux'

type ActiveInstance = {
  id: string
  location: string
  // todo: assignedAt so we can sort by most recent?
}

const EditorActiveInstanceState = defineState({
  name: 'EditorActiveInstanceState',
  initial: () => ({
    activeInstances: [] as ActiveInstance[]
  })
})

export const EditorActiveInstanceServiceReceptor = (action): any => {
  getState(EditorActiveInstanceState).batch((s) => {
    matches(action).when(EditorActiveInstanceAction.fetchedActiveInstances.matches, (action) => {
      return s.merge({ activeInstances: action.activeInstances })
    })
  })
}

export const accessEditorActiveInstanceState = () => getState(EditorActiveInstanceState)

export const useEditorActiveInstanceState = () => useState(accessEditorActiveInstanceState())

//Service
export const EditorActiveInstanceService = {
  getActiveInstances: async (sceneId: string) => {
    const activeInstances = await client.service('instances-active').find({
      query: { sceneId }
    })
    dispatchAction(EditorActiveInstanceAction.fetchedActiveInstances({ activeInstances }))
  }
}

//Action
export class EditorActiveInstanceAction {
  static fetchedActiveInstances = defineAction({
    type: 'editorActiveInstance.FETCHED_ACTIVE_INSTANCES' as const,
    activeInstances: matches.array as Validator<unknown, ActiveInstance[]>
  })
}
