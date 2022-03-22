import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

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
      .map((entity) => useWorld().entityTree.entityNodeMap.get(entity))
      .filter((entity) => entity) as EntityTreeNode[]

    if (nodes) {
      executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, nodes)
    }
  } else if ((data = event.clipboardData.getData('text')) !== '') {
    try {
      const url = new URL(data)
      addMediaNode(url.href).catch((error) => store.dispatch(EditorErrorAction.throwError(error)))
    } catch (e) {
      console.warn('Clipboard contents did not contain a valid url')
    }
  }
}
