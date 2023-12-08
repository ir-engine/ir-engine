/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import BufferHandlerExtension from '@etherealengine/engine/src/assets/exporters/gltf/extensions/BufferHandlerExtension'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { defineActionQueue } from '@etherealengine/hyperflux'

import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemGroups'
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
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
