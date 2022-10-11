import BufferHandlerExtension from '@xrengine/engine/src/assets/exporters/gltf/extensions/BufferHandlerExtension'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { clearModelResources, uploadProjectFiles } from '../functions/assetFunctions'
import { accessEditorState } from '../services/EditorServices'

export default async function ModelHandlingSystem(world: World) {
  const beginModelExportQueue = createActionQueue(BufferHandlerExtension.beginModelExport.matches)
  const saveBufferQueue = createActionQueue(BufferHandlerExtension.saveBuffer.matches)
  const editorState = accessEditorState()

  const executionPromises = new Map<string, Promise<void>>()
  const executionPromiseKey = ({ projectName, modelName }) => `${projectName}-${modelName}`

  const getPromise = ({ projectName, modelName }) =>
    executionPromises.get(executionPromiseKey({ projectName, modelName })) ?? Promise.resolve()

  const execute = () => {
    beginModelExportQueue().map((action) => {
      const key = executionPromiseKey(action)
      const currentPromise = getPromise(action)
      executionPromises.set(
        key,
        currentPromise.then(() => clearModelResources(action.projectName, action.modelName))
      )
    })
    saveBufferQueue().map(({ saveParms, projectName, modelName }) => {
      const blob = new Blob([saveParms.buffer])
      const file = new File([blob], saveParms.uri)
      const currentPromise = getPromise({ projectName, modelName })
      executionPromises.set(
        executionPromiseKey({ projectName, modelName }),
        currentPromise.then(() =>
          Promise.all(uploadProjectFiles(projectName, [file], true).promises).then(() => Promise.resolve())
        )
      )
    })
  }

  const cleanup = async () => {
    removeActionQueue(beginModelExportQueue)
    removeActionQueue(saveBufferQueue)
  }

  return { execute, cleanup }
}
