import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommandWithHistory } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { EditorErrorAction } from '../services/EditorErrorServices'
import { accessSelectionState } from '../services/SelectionServices'
import { addMediaNode } from './addMediaNode'
import isInputSelected from './isInputSelected'

export function copy(event) {
  if (isInputSelected()) return
  event.preventDefault()

  // TODO: Prevent copying objects with a disabled transform
  if (accessSelectionState().selectedEntities.length > 0) {
    event.clipboardData.setData(
      'application/vnd.editor.nodes',
      JSON.stringify({ entities: accessSelectionState().selectedEntities.value })
    )
  }
}

export function paste(event) {
  if (isInputSelected()) return
  event.preventDefault()

  let data

  if ((data = event.clipboardData.getData('application/vnd.editor.nodes')) !== '') {
    const { entities } = JSON.parse(data)

    if (!Array.isArray(entities)) return
    const nodes = entities
      .map((entity) => Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity))
      .filter((entity) => entity) as EntityTreeNode[]

    if (nodes) {
      executeCommandWithHistory({ type: EditorCommands.DUPLICATE_OBJECTS, affectedNodes: nodes })
    }
  } else if ((data = event.clipboardData.getData('text')) !== '') {
    try {
      const url = new URL(data)
      addMediaNode(url.href).catch((error) => dispatchAction(EditorErrorAction.throwError({ error })))
    } catch (e) {
      console.warn('Clipboard contents did not contain a valid url')
    }
  }
}
