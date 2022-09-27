import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, SelectionCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type ReplaceSelectionCommandUndoParams = {
  selection: (Entity | string)[]
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
  dispatchAction(SelectionAction.changedBeforeSelection({}))
}

function emitEventAfter(command: ReplaceSelectionCommandParams) {
  if (command.preventEvents) return
  updateOutlinePassSelection()
}

function replaceSelection(command: ReplaceSelectionCommandParams, isUndo: boolean): void {
  // Check whether selection is changed or not
  const nodes = isUndo && command.undo ? getEntityNodeArrayFromEntities(command.undo.selection) : command.affectedNodes
  const selectedEntities = accessSelectionState().selectedEntities.value

  if (
    !isSelectionChanged(
      selectedEntities,
      nodes.map((n) => (typeof n === 'string' ? n : n.entity))
    )
  )
    return

  // Fire deselect event for old objects
  for (let i = 0; i < selectedEntities.length; i++) {
    const entity = selectedEntities[i]
    let includes = false

    for (const node of nodes) {
      if (typeof node === 'string') {
        if (node === entity) {
          includes = true
          break
        }
      } else {
        if (node.entity === entity) {
          includes = true
          break
        }
      }
    }

    if (!includes && typeof entity === 'number' && entityExists(entity)) {
      removeComponent(entity, SelectTagComponent)
    }
  }

  const newlySelectedEntities = [] as (Entity | string)[]

  // Replace selection with new objects and fire select event
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') {
      newlySelectedEntities.push(node)
    } else {
      // temporary support for Object3Ds being selected
      if (typeof node.entity === 'undefined') {
        newlySelectedEntities.push(node.uuid as any)
        continue
      }
      newlySelectedEntities.push(node.entity)

      if (!hasComponent(node.entity, SelectTagComponent)) {
        addComponent(node.entity, SelectTagComponent, {})
      }
    }
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities: newlySelectedEntities }))
}

function toString(command: ReplaceSelectionCommandParams) {
  return `SelectMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(command.affectedNodes)}`
}

function isSelectionChanged(oldSelection: (Entity | string)[], newSelection: (Entity | string)[]) {
  if (newSelection.length !== oldSelection.length) return true

  for (let i = 0; i < newSelection.length; i++) {
    if (!oldSelection.includes(newSelection[i])) return true
  }

  return false
}

export const ReplaceSelectionCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  emitEventBefore,
  toString
}
