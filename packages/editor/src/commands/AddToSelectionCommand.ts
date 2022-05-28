import { store } from '@xrengine/client-core/src/store'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, SelectionCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type AddToSelectionCommandUndoParams = {
  selection: Entity[]
}

export type AddToSelectionCommandParams = CommandParams & {
  type: SelectionCommands.ADD_TO_SELECTION

  undo?: AddToSelectionCommandUndoParams
}

function prepare(command: AddToSelectionCommandParams) {
  if (command.keepHistory) {
    command.undo = { selection: accessSelectionState().selectedEntities.value.slice(0) }
  }
}

function execute(command: AddToSelectionCommandParams) {
  emitEventBefore(command)

  const selectedEntities = accessSelectionState().selectedEntities.value.slice(0)

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const object = command.affectedNodes[i]
    if (selectedEntities.includes(object.entity)) continue

    addComponent(object.entity, SelectTagComponent, {})
    selectedEntities.push(object.entity)
  }

  store.dispatch(SelectionAction.updateSelection(selectedEntities))

  emitEventAfter(command)
}

function undo(command: AddToSelectionCommandParams) {
  if (command.undo) {
    executeCommand({
      type: EditorCommands.REPLACE_SELECTION,
      affectedNodes: getEntityNodeArrayFromEntities(command.undo.selection)
    })
  }
}

function emitEventBefore(command: AddToSelectionCommandParams) {
  if (command.preventEvents) return

  cancelGrabOrPlacement()
  store.dispatch(SelectionAction.changedBeforeSelection())
}

function emitEventAfter(command: AddToSelectionCommandParams) {
  if (command.preventEvents) return
  updateOutlinePassSelection()
}

function toString(command: AddToSelectionCommandParams) {
  return `AddToSelection Command id: ${command.id} objects: ${serializeObject3DArray(command.affectedNodes)}`
}

export const AddToSelectionCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  emitEventBefore,
  toString
}
