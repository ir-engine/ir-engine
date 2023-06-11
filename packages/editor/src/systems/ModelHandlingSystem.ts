import { useEffect } from 'react'

import BufferHandlerExtension from '@etherealengine/engine/src/assets/exporters/gltf/extensions/BufferHandlerExtension'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { defineActionQueue } from '@etherealengine/hyperflux'

import { clearModelResources, uploadProjectFiles } from '../functions/assetFunctions'

const beginModelExportQueue = defineActionQueue(BufferHandlerExtension.beginModelExport.matches)
const saveBufferQueue = defineActionQueue(BufferHandlerExtension.saveBuffer.matches)

const executionPromises = new Map<string, Promise<void>>()
const executionPromiseKey = ({ projectName, modelName }) => `${projectName}-${modelName}`

const getPromise = ({ projectName, modelName }) =>
  executionPromises.get(executionPromiseKey({ projectName, modelName })) ?? Promise.resolve()

/** @todo convert these to reactors */
const execute = () => {
  for (const action of beginModelExportQueue()) {
    const key = executionPromiseKey(action)
    const currentPromise = getPromise(action)
    executionPromises.set(
      key,
      currentPromise.then(() => clearModelResources(action.projectName, action.modelName))
    )
  }

  for (const action of saveBufferQueue()) {
    const { saveParms, projectName, modelName } = action
    const blob = new Blob([saveParms.buffer])
    const file = new File([blob], saveParms.uri)
    const currentPromise = getPromise({ projectName, modelName })
    executionPromises.set(
      executionPromiseKey({ projectName, modelName }),
      currentPromise.then(() =>
        Promise.all(uploadProjectFiles(projectName, [file], true).promises).then(() => Promise.resolve())
      )
    )
  }
}

const reactor = () => {
  useEffect(() => {
    return () => {
      executionPromises.clear()
    }
  }, [])
  return null
}

export const ModelHandlingSystem = defineSystem({
  uuid: 'ee.editor.ModelHandlingSystem',
  execute,
  reactor
})
