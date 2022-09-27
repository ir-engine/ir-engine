import BufferHandlerExtension from '@xrengine/engine/src/assets/exporters/gltf/extensions/BufferHandlerExtension'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { uploadProjectFiles } from '../functions/assetFunctions'
import { accessEditorState } from '../services/EditorServices'

export default async function ModelHandlingSystem(world: World) {
  const saveBufferQueue = createActionQueue(BufferHandlerExtension.saveBuffer.matches)
  const editorState = accessEditorState()
  const execute = () => {
    const pName = editorState.projectName.get()!
    saveBufferQueue().map(({ saveParms }) => {
      const blob = new Blob([saveParms.buffer])
      const file = new File([blob], `model-resources/${/[^\/]+$/.exec(saveParms.uri)![0]}`)
      Promise.all(uploadProjectFiles(pName, [file], true).promises)
      //.then(urls => console.log('saved buffer', saveParms, 'to project', pName, 'at urls', urls))
    })
  }

  const cleanup = async () => {
    removeActionQueue(saveBufferQueue)
  }

  return { execute, cleanup }
}
