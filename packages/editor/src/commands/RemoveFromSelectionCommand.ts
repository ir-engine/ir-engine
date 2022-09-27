import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, SelectionCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type RemoveFromSelectionCommandUndoParams = {
  selection: (Entity | string)[]
}

export type RemoveFromSelectionCommandParams = CommandParams & {
  type: SelectionCommands.REMOVE_FROM_SELECTION

  undo?: RemoveFromSelectionCommandUndoParams
}

function prepare(command: RemoveFromSelectionCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      selection: accessSelectionState().selectedEntities.value.filter((ent) => typeof ent !== 'string') as Entity[]
    }
  }
}

function execute(command: RemoveFromSelectionCommandParams) {
  emitEventBefore(command)

  const selectedEntities = accessSelectionState().selectedEntities.value.slice(0)

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const object = command.affectedNodes[i]

    const index = selectedEntities.indexOf(typeof object === 'string' ? object : object.entity)
    if (index === -1) continue

    selectedEntities.splice(index, 1)
    if (typeof object !== 'string') removeComponent(object.entity, SelectTagComponent)
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))

  emitEventAfter(command)
}

function undo(command: RemoveFromSelectionCommandParams) {
  if (command.undo) {
    executeCommand({
      type: EditorCommands.REPLACE_SELECTION,
      affectedNodes: getEntityNodeArrayFromEntities(command.undo.selection)
    })
  }
}

function emitEventBefore(command: RemoveFromSelectionCommandParams) {
  if (command.preventEvents) return

  cancelGrabOrPlacement()
  dispatchAction(SelectionAction.changedBeforeSelection({}))
}

function emitEventAfter(command: RemoveFromSelectionCommandParams) {
  if (command.preventEvents) return

  updateOutlinePassSelection()
}

function toString(command: RemoveFromSelectionCommandParams) {
  return `SelectMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(command.affectedNodes)}`
}

export const RemoveFromSelectionCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  emitEventBefore,
  toString
}
