import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'

import { ModifyMaterialCommand, ModifyMaterialCommandParams } from '../commands/ModifyMaterialCommand'
import { ModifyObj3DCommandParams } from '../commands/ModifyObject3DCommand'
import { ModifyObj3DCommand } from '../commands/ModifyObject3DCommand'

export enum ParentCommands {
  GROUP = 'GROUP'
}

export enum TransformCommands {
  ROTATE_AROUND = 'ROTATE_AROUND'
}

export enum MiscCommands {
  MODIFY_OBJECT3D = 'MODIFY_OBJECT3D',
  MODIFY_MATERIAL = 'MODIFY_MATERIAL'
}

export const EditorCommands = {
  ...ParentCommands,
  ...TransformCommands,
  ...MiscCommands
}

export type EditorCommandsType = ParentCommands | TransformCommands | MiscCommands

export default EditorCommands

export type CommandParams = {
  /** typeof the command which will be executed */
  type: EditorCommandsType

  /** Id of the commnad used to track undo and redo state */
  id?: number

  /** An Object which is affected by this command */
  affectedNodes: (EntityTreeNode | string)[]

  /** Whether the event should be emited of not */
  preventEvents?: boolean

  /** Whether the selection should be updated or not */
  updateSelection?: boolean

  /** Whether this command should keep old data of the objects. Which will be used in unod operations */
  keepHistory?: boolean
}

export type CommandFuncType = {
  /** Prepares command for the execution */
  prepare(command: CommandParams): void

  /** Executes the command logic */
  execute(command: CommandParams): void

  /** Undo the command effect */
  undo(command: CommandParams): void

  /** Checks whether the command should update its state or not */
  shouldUpdate?(currentCommand: CommandParams, newCommand: CommandParams): boolean

  /** Updates the commnad state */
  update?(currentCommand: CommandParams, newCommand: CommandParams): void

  /** Emits event before executing this function */
  emitEventBefore?(command: CommandParams): void

  /** Emits event after executing this function */
  emitEventAfter?(command: CommandParams): void

  /** Returns the string representation of the command */
  toString(command: CommandParams): string
}

export const CommandFuncs: {
  [key: string]: CommandFuncType
} = {
  [EditorCommands.MODIFY_OBJECT3D]: ModifyObj3DCommand,
  [EditorCommands.MODIFY_MATERIAL]: ModifyMaterialCommand
}

export type CommandParamsType = ModifyObj3DCommandParams | ModifyMaterialCommandParams

export type CommandParamsOmitAffectedNodes =
  | Omit<ModifyObj3DCommandParams, 'affectedNodes'>
  | Omit<ModifyMaterialCommandParams, 'affectedNodes'>
