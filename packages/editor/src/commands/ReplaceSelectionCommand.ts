import { store } from '@xrengine/client-core/src/store'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'

import { CommandFuncType, CommandParams, SelectionCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type ReplaceSelectionCommandUndoParams = {
  selection: Entity[]
}

export type ReplaceSelectionCommandParams = CommandParams & {
  type: SelectionCommands.REPLACE_SELECTION
  undo?: ReplaceSelectionCommandUndoParams
}

function prepare(command: ReplaceSelectionCommandParams) {
  if (command.keepHistory) {
    command.undo = { selection: accessSelectionState().selectedEntities.value.slice(0) }
  }
}

function execute(command: ReplaceSelectionCommandParams) {
  emitEventBefore(command)
  replaceSelection(command, false)
  emitEventAfter(command)
}

function undo(command: ReplaceSelectionCommandParams) {
  emitEventBefore(command)
  replaceSelection(command, true)
  emitEventAfter(command)
}

function emitEventBefore(command: ReplaceSelectionCommandParams) {
  if (command.preventEvents) return

  cancelGrabOrPlacement()
  store.dispatch(SelectionAction.changedBeforeSelection())
}

function emitEventAfter(command: ReplaceSelectionCommandParams) {
  if (command.preventEvents) return
  updateOutlinePassSelection()
}

function replaceSelection(command: ReplaceSelectionCommandParams, isUndo: boolean): void {
  // Check whether selection is changed or not
  const nodes = isUndo && command.undo ? getEntityNodeArrayFromEntities(command.undo.selection) : command.affectedNodes

  const selectedEntities = accessSelectionState().selectedEntities.value.slice(0)

  if (nodes.length === selectedEntities.length) {
    for (let i = 0; i < nodes.length; i++) {
      if (!selectedEntities.includes(nodes[i].entity)) return
    }
  }

  // Fire deselect event for old objects
  for (let i = 0; i < selectedEntities.length; i++) {
    const entity = selectedEntities[i]
    let includes = false

    for (const node of nodes) {
      if (node.entity === entity) {
        includes = true
        break
      }
    }

    if (!includes) {
      removeComponent(entity, SelectTagComponent)
    }
  }

  const newlySelectedEntities = [] as Entity[]

  // Replace selection with new objects and fire select event
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    newlySelectedEntities.push(node.entity)

    if (!hasComponent(node.entity, SelectTagComponent)) {
      addComponent(node.entity, SelectTagComponent, {})
    }
  }

  store.dispatch(SelectionAction.updateSelection(newlySelectedEntities))
}

function toString(command: ReplaceSelectionCommandParams) {
  return `SelectMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(command.affectedNodes)}`
}

export const ReplaceSelectionCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  emitEventBefore,
  toString
}
