/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { Component } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { dispatchAction } from '@xrengine/hyperflux'

import { ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import EditorCommands, {
  CommandFuncs,
  CommandFuncType,
  CommandParamsOmitAffectedNodes,
  CommandParamsType
} from '../constants/EditorCommands'
import { accessEditorState } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

const logger = multiLogger.child({ component: 'editor:History' })

const ALLOWED_TIME_FOR_MERGER = 1000

export type EditorHistoryType = {
  undos: CommandParamsType[]
  redos: CommandParamsType[]
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
 * Executes command with out history.
 * @param command Command to be executed
 */
export function executeCommand(command: CommandParamsType): void {
  if (typeof command.updateSelection === 'undefined') command.updateSelection = true
  const commandFunctions = CommandFuncs[command.type]
  commandFunctions.prepare(command)
  commandFunctions.execute(command)

  logger.info('[executeCommand]', command.type, command)
  dispatchAction(SelectionAction.changedObject({ objects: command.affectedNodes, propertyName: '' }))
}

/**
 * Executes command with history.
 * @param command Command to be executed
 */
export function executeCommandWithHistory(command: CommandParamsType): void {
  command.keepHistory = true
  if (typeof command.updateSelection === 'undefined') command.updateSelection = true
  const commandFunctions = CommandFuncs[command.type]
  commandFunctions.prepare(command)

  const lastCmd = EditorHistory.undos[EditorHistory.undos.length - 1]
  const timeDifference = new Date().getTime() - EditorHistory.lastCmdTime.getTime()

  if (
    EditorHistory.commandUpdatesEnabled &&
    lastCmd &&
    lastCmd.type === command.type &&
    timeDifference < ALLOWED_TIME_FOR_MERGER &&
    commandFunctions.shouldUpdate?.(lastCmd, command)
  ) {
    commandFunctions.update?.(lastCmd, command)

    if (EditorHistory.debug) {
      logger.info(`update: ${commandFunctions.toString(lastCmd)}`)
    }
  } else {
    // the command is not updatable and is added as a new part of the history
    EditorHistory.undos.push(command)
    command.id = ++EditorHistory.idCounter
    commandFunctions.execute(command)

    if (EditorHistory.debug) {
      logger.info(`execute: ${commandFunctions.toString(command)}`)
    }
  }

  EditorHistory.lastCmdTime = new Date()

  // clearing all the redo-commands
  EditorHistory.redos = []

  logger.info('[executeCommandWithHistory]', command.type, command)
  dispatchAction(SelectionAction.changedObject({ objects: command.affectedNodes, propertyName: '' }))
}

/**
 * Executes command with out history on selected entities.
 * @param command Command to be executed
 */
export function executeCommandOnSelection(command: CommandParamsOmitAffectedNodes): void {
  ;(command as CommandParamsType).affectedNodes = getEntityNodeArrayFromEntities(
    accessSelectionState().selectedEntities.value
  )
  executeCommand(command as CommandParamsType)
}

/**
 * Executes command with history on selected entities.
 * @param command Command to be executed
 */
export function executeCommandWithHistoryOnSelection(command: CommandParamsOmitAffectedNodes): void {
  command.keepHistory = true
  ;(command as CommandParamsType).affectedNodes = getEntityNodeArrayFromEntities(
    accessSelectionState().selectedEntities.value
  )
  executeCommandWithHistory(command as CommandParamsType)
}

/**
 * Modifies the property for the nodes passed in command
 * @param command Nodes which properties are going to be updated
 * @param withHistory Whether to record this command to history or not
 */
export function executeModifyPropertyCommand<C extends Component<any, any>>(
  command: Omit<ModifyPropertyCommandParams<C>, 'type'>,
  withHistory = true
) {
  ;(command as ModifyPropertyCommandParams<C>).type = EditorCommands.MODIFY_PROPERTY

  if (withHistory) {
    executeCommandWithHistory(command as ModifyPropertyCommandParams<C>)
  } else {
    executeCommand(command as ModifyPropertyCommandParams<C>)
  }
}

/**
 * Sets property on selected entities
 * @param params Params for command
 * @param withHistory Whether to record this command to history or not
 */
export function setPropertyOnSelectionEntities<C extends Component<any, any>>(
  command: Omit<ModifyPropertyCommandParams<C>, 'type' | 'affectedNodes'>,
  withHistory = true
) {
  const editorState = accessEditorState()
  const selectionState = accessSelectionState()

  ;(command as ModifyPropertyCommandParams<C>).affectedNodes = editorState.lockPropertiesPanel.value
    ? [Engine.instance.currentWorld.entityTree.uuidNodeMap.get(editorState.lockPropertiesPanel.value)!]
    : getEntityNodeArrayFromEntities(selectionState.selectedEntities.value)
  executeModifyPropertyCommand(command as ModifyPropertyCommandParams<C>, withHistory)
}

/**
 * Sets property on the the nodes passed in command
 * @param command Node which will be updated
 * @param withHistory Whether to record this command to history or not
 */
export function setPropertyOnEntityNode<C extends Component<any, any>>(
  command: Omit<ModifyPropertyCommandParams<C>, 'type'>,
  withHistory = true
) {
  executeModifyPropertyCommand(command, withHistory)
}

/**
 * Reverts the history to the probided checkpoint
 * @param checkpointId Id of the checkpoint
 */
export function revertHistory(checkpointId: Entity): void {
  if (EditorHistory.undos.length === 0) return

  const lastCmd = EditorHistory.undos[EditorHistory.undos.length - 1]

  if (typeof lastCmd.id === 'undefined') return

  if (lastCmd && checkpointId > lastCmd.id) {
    logger.warn('Tried to revert back to an undo action with an id greater than the last action')
    return
  }

  let cmd = EditorHistory.undos.pop()!
  let commandFunctions: CommandFuncType

  while (EditorHistory.undos.length > 0 && checkpointId !== cmd.id) {
    commandFunctions = CommandFuncs[cmd.type]
    commandFunctions.undo(cmd)
    EditorHistory.redos.push(cmd)

    if (EditorHistory.debug) {
      logger.info(`revert: ${commandFunctions.toString(cmd)}`)
    }
    cmd = EditorHistory.undos.pop()!
  }
}

/**
 * Undos the effect of latest executed command
 * @returns Command which was undone
 */
export function undoCommand(): CommandParamsType | undefined {
  if (EditorHistory.undos.length === 0) return

  const cmd = EditorHistory.undos.pop()!
  CommandFuncs[cmd.type].undo(cmd)
  EditorHistory.redos.push(cmd)

  if (EditorHistory.debug) {
    logger.info(`undo: ${CommandFuncs[cmd.type].toString(cmd)}`)
  }

  return cmd
}

/**
 * undos the effect of undo command
 * @returns command which was undone
 */
export function redoCommand(): CommandParamsType | undefined {
  if (EditorHistory.redos.length === 0) return

  const cmd = EditorHistory.redos.pop()!
  CommandFuncs[cmd.type].undo(cmd)
  EditorHistory.undos.push(cmd)

  if (EditorHistory.debug) {
    logger.info(`redo: ${CommandFuncs[cmd.type].toString(cmd)}`)
  }

  return cmd
}

/**
 * @returns Debug lof for all the commands
 */
export function getDebugLogForHistory(): string {
  return EditorHistory.undos
    .map((cmd) => {
      CommandFuncs[cmd.type].toString(cmd)
    })
    .join('\n')
}

/**
 * Clears command history
 */
export function clearHistory(): void {
  EditorHistory.undos = []
  EditorHistory.redos = []
  EditorHistory.idCounter = 0
}
