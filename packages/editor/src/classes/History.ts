/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { MappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'

import Command from '../commands/Command'
import { ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import EditorCommands, { CommandParamsType, Commands, EditorCommandsType } from '../constants/EditorCommands'
import { accessSelectionState } from '../services/SelectionServices'

const ALLOWED_TIME_FOR_MERGER = 1000

export type EditorHistoryType = {
  undos: Command[]
  redos: Command[]
  lastCmdTime: Date
  idCounter: number
  commandUpdatesEnabled: boolean
  debug: boolean
  grabCheckPoint?: Entity
}

export const EditorHistory: EditorHistoryType = {
  undos: [],
  redos: [],
  lastCmdTime: new Date(),
  idCounter: 0,
  commandUpdatesEnabled: true,
  debug: false
}

/**
 * Executes command with out history passed objects.
 * @param command Command to be executed
 * @param object a node or an array of nodes on which command will be executed
 * @param params Params for the command
 */
export function executeCommand(
  command: EditorCommandsType,
  object: EntityTreeNode | EntityTreeNode[],
  params: CommandParamsType = {}
): void {
  if (!params) params = {}
  new Commands[command](Array.isArray(object) ? object : [object], params).execute()
}

/**
 * Executes command with history passed objects.
 * @param command Command to be executed
 * @param object a node or an array of nodes on which command will be executed
 * @param params Params for the command
 */
export function executeCommandWithHistory(
  command: EditorCommandsType,
  object: EntityTreeNode | EntityTreeNode[],
  params: CommandParamsType = {}
): void {
  params.keepHistory = true
  let cmd = new Commands[command](Array.isArray(object) ? object : [object], params)
  const lastCmd = EditorHistory.undos[EditorHistory.undos.length - 1]
  const timeDifference = new Date().getTime() - EditorHistory.lastCmdTime.getTime()

  if (
    EditorHistory.commandUpdatesEnabled &&
    lastCmd &&
    lastCmd.constructor === cmd.constructor &&
    timeDifference < ALLOWED_TIME_FOR_MERGER &&
    lastCmd.shouldUpdate(cmd)
  ) {
    lastCmd.update(cmd)
    cmd = lastCmd

    if (EditorHistory.debug) console.log(`update:`, cmd)
  } else {
    // the command is not updatable and is added as a new part of the history
    EditorHistory.undos.push(cmd)
    cmd.id = ++EditorHistory.idCounter
    cmd.execute()

    if (EditorHistory.debug) console.log(`execute:`, cmd)
  }

  EditorHistory.lastCmdTime = new Date()

  // clearing all the redo-commands
  EditorHistory.redos = []
}

/**
 * Executes command with out history on selected entities.
 * @param command Command to be executed
 * @param params Params for the command
 */
export function executeCommandOnSelection(command: EditorCommandsType, params: CommandParamsType = {}): void {
  const selection = getEntityNodeArrayFromEntities(accessSelectionState().selectedEntities.value)
  executeCommand(command, selection, params)
}

/**
 * Executes command with history on selected entities.
 * @param command Command to be executed
 * @param params Params for the command
 */
export function executeCommandWithHistoryOnSelection(
  command: EditorCommandsType,
  params: CommandParamsType = {}
): void {
  params.keepHistory = true
  const selection = getEntityNodeArrayFromEntities(accessSelectionState().selectedEntities.value)
  executeCommandWithHistory(command, selection, params)
}

/**
 * Modifies the property for the provided nodes
 * @param affectedEntityNodes Nodes which properties are going to be updated
 * @param params Params for the command
 * @param withHistory Whether to record this command to history or not
 */
export function executeModifyPropertyCommand<C extends MappedComponent<any, any>>(
  affectedEntityNodes: EntityTreeNode[],
  params: ModifyPropertyCommandParams<C>,
  withHistory = true
) {
  if (withHistory) {
    executeCommandWithHistory(EditorCommands.MODIFY_PROPERTY, affectedEntityNodes, params)
  } else {
    executeCommand(EditorCommands.MODIFY_PROPERTY, affectedEntityNodes, params)
  }
}

/**
 * Sets property on selected entities
 * @param params Params for command
 * @param withHistory Whether to record this command to history or not
 */
export function setPropertyOnSelectionEntities<C extends MappedComponent<any, any>>(
  params: ModifyPropertyCommandParams<C>,
  withHistory = true
) {
  const selection = getEntityNodeArrayFromEntities(accessSelectionState().selectedEntities.value)
  executeModifyPropertyCommand(selection, params, withHistory)
}

/**
 * Sets property on the provided node
 * @param node Node which will be updated
 * @param params Params for command
 * @param withHistory Whether to record this command to history or not
 */
export function setPropertyOnEntityNode<C extends MappedComponent<any, any>>(
  node: EntityTreeNode,
  params: ModifyPropertyCommandParams<C>,
  withHistory = true
) {
  executeModifyPropertyCommand([node], params, withHistory)
}

/**
 * Reverts the history to the probided checkpoint
 * @param checkpointId Id of the checkpoint
 */
export function revertHistory(checkpointId: Entity): void {
  if (EditorHistory.undos.length === 0) {
    return
  }

  const lastCmd = EditorHistory.undos[EditorHistory.undos.length - 1]

  if (lastCmd && checkpointId > lastCmd.id) {
    console.warn('Tried to revert back to an undo action with an id greater than the last action')
    return
  }

  let cmd = EditorHistory.undos.pop()!
  while (EditorHistory.undos.length > 0 && checkpointId !== cmd.id) {
    cmd.undo()
    EditorHistory.redos.push(cmd)

    if (EditorHistory.debug) console.log(`revert: ${cmd}`)
    cmd = EditorHistory.undos.pop()!
  }
}

/**
 * Undos the effect of latest executed command
 * @returns Command which was undone
 */
export function undoCommand(): Command | undefined {
  if (EditorHistory.undos.length === 0) return

  const cmd = EditorHistory.undos.pop()!
  cmd.undo()
  EditorHistory.redos.push(cmd)

  if (EditorHistory.debug) console.log(`undo: ${cmd}`)

  return cmd
}

/**
 * undos the effect of undo command
 * @returns command which was undone
 */
export function redoCommand(): Command | undefined {
  if (EditorHistory.redos.length === 0) return

  const cmd = EditorHistory.redos.pop()!
  cmd.undo()
  EditorHistory.undos.push(cmd)

  if (EditorHistory.debug) console.log(`redo: ${cmd}`)

  return cmd
}

/**
 * @returns Debug lof for all the commands
 */
export function getDebugLogForHistory(): string {
  return EditorHistory.undos.map((cmd) => cmd.toString()).join('\n')
}

/**
 * Clears command history
 */
export function clearHistory(): void {
  EditorHistory.undos = []
  EditorHistory.redos = []
  EditorHistory.idCounter = 0
}
