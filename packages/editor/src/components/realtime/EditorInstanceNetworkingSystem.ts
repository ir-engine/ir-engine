import { useEffect } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineSystem, PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { addActionReceptor, getMutableState, getState, removeActionReceptor } from '@etherealengine/hyperflux'

import { EditorState } from '../../services/EditorServices'
import { EditorActiveInstanceService, EditorActiveInstanceServiceReceptor } from './EditorActiveInstanceService'

let accumulator = 0

const execute = () => {
  const editorState = getState(EditorState)
  accumulator += Engine.instance.deltaSeconds

  if (accumulator > 5) {
    accumulator = 0
    const sceneId = `${editorState.projectName}/${editorState.sceneName}`
    EditorActiveInstanceService.getActiveInstances(sceneId)
  }
}

const reactor = () => {
  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: true,
      media: false,
      friends: false,
      instanceID: false,
      roomID: false
    })

    addActionReceptor(EditorActiveInstanceServiceReceptor)

    return () => {
      removeActionReceptor(EditorActiveInstanceServiceReceptor)
    }
  }, [])
  return null
}

export const EditorInstanceNetworkingSystem = defineSystem(
  {
    uuid: 'ee.editor.EditorInstanceNetworkingSystem',
    execute,
    reactor
  },
  { after: [PresentationSystemGroup] }
)
