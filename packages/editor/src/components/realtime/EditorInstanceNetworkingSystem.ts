import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { addActionReceptor, getMutableState, getState, removeActionReceptor } from '@etherealengine/hyperflux'

import { EditorState } from '../../services/EditorServices'
import { EditorActiveInstanceService, EditorActiveInstanceServiceReceptor } from './EditorActiveInstanceService'

export default async function EditorInstanceNetworkingSystem() {
  getMutableState(NetworkState).config.set({
    world: true,
    media: false,
    party: false,
    instanceID: false,
    roomID: false
  })

  addActionReceptor(EditorActiveInstanceServiceReceptor)

  const editorState = getState(EditorState)

  let accumulator = 0

  const execute = () => {
    accumulator += Engine.instance.deltaSeconds

    if (accumulator > 5) {
      const sceneId = `${editorState.projectName}/${editorState.sceneName}`
      EditorActiveInstanceService.getActiveInstances(sceneId)
    }
  }

  const cleanup = async () => {
    removeActionReceptor(EditorActiveInstanceServiceReceptor)
  }

  return { execute, cleanup }
}
