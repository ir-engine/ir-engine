import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

import { AddObjectCommand, AddObjectCommandParams } from '../commands/AddObjectCommand'
import { AddToSelectionCommand, AddToSelectionCommandParams } from '../commands/AddToSelectionCommand'
import { DuplicateObjectCommand, DuplicateObjectCommandParams } from '../commands/DuplicateObjectCommand'
import { GroupCommand, GroupCommandParams } from '../commands/GroupCommand'
import { ModifyPropertyCommand, ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import { PositionCommand, PositionCommandParams } from '../commands/PositionCommand'
import { RemoveFromSelectionCommand, RemoveFromSelectionCommandParams } from '../commands/RemoveFromSelectionCommand'
import { RemoveObjectCommand, RemoveObjectCommandParams } from '../commands/RemoveObjectsCommand'
import { ReparentCommand, ReparentCommandParams } from '../commands/ReparentCommand'
import { ReplaceSelectionCommand, ReplaceSelectionCommandParams } from '../commands/ReplaceSelectionCommand'
import { RotateAroundCommand, RotateAroundCommandParams } from '../commands/RotateAroundCommand'
import { RotationCommand, RotationCommandParams } from '../commands/RotationCommand'
import { ScaleCommand, ScaleCommandParams } from '../commands/ScaleCommand'
import { TagComponentCommand, TagComponentCommandParams } from '../commands/TagComponentCommand'
import { ToggleSelectionCommand, ToggleSelectionCommandParams } from '../commands/ToggleSelectionCommand'

export enum ObjectCommands {
  ADD_OBJECTS = 1,
  REMOVE_OBJECTS = 2,
  DUPLICATE_OBJECTS = 3,
  MODIFY_PROPERTY = 4
}

export enum SelectionCommands {
  ADD_TO_SELECTION = 5,
  REMOVE_FROM_SELECTION = 6,
  TOGGLE_SELECTION = 7,
  REPLACE_SELECTION = 8
}

export enum ParentCommands {
  REPARENT = 9,
  GROUP = 10
}

export enum TransformCommands {
  POSITION = 11,
  ROTATION = 12,
  SCALE = 13,
  ROTATE_AROUND = 14
}

export enum MiscCommands {
  TAG_COMPONENT = 15
}

export const EditorCommands = {
  ...ObjectCommands,
  ...SelectionCommands,
  ...ParentCommands,
  ...TransformCommands,
  ...MiscCommands
}

export type EditorCommandsType = ObjectCommands | SelectionCommands | ParentCommands | TransformCommands | MiscCommands

export default EditorCommands

export type CommandParams = {
  /** typeof the command which will be executed */
  type: EditorCommandsType

  /** Id of the commnad used to track undo and redo state */
  id?: number

  /** An Object which is affected by this command */
  affectedNodes: EntityTreeNode[]

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
  [EditorCommands.ADD_OBJECTS]: AddObjectCommand,
  [EditorCommands.DUPLICATE_OBJECTS]: DuplicateObjectCommand,
  [EditorCommands.REMOVE_OBJECTS]: RemoveObjectCommand,
  [EditorCommands.ADD_TO_SELECTION]: AddToSelectionCommand,
  [EditorCommands.REMOVE_FROM_SELECTION]: RemoveFromSelectionCommand,
  [EditorCommands.TOGGLE_SELECTION]: ToggleSelectionCommand,
  [EditorCommands.REPLACE_SELECTION]: ReplaceSelectionCommand,
  [EditorCommands.REPARENT]: ReparentCommand,
  [EditorCommands.GROUP]: GroupCommand,
  [EditorCommands.POSITION]: PositionCommand,
  [EditorCommands.ROTATION]: RotationCommand,
  [EditorCommands.ROTATE_AROUND]: RotateAroundCommand,
  [EditorCommands.SCALE]: ScaleCommand,
  [EditorCommands.MODIFY_PROPERTY]: ModifyPropertyCommand,
  [EditorCommands.TAG_COMPONENT]: TagComponentCommand
}

export type CommandParamsType =
  | AddObjectCommandParams
  | RemoveObjectCommandParams
  | DuplicateObjectCommandParams
  | ModifyPropertyCommandParams<any>
  | ReparentCommandParams
  | GroupCommandParams
  | PositionCommandParams
  | RotationCommandParams
  | ScaleCommandParams
  | RotateAroundCommandParams
  | TagComponentCommandParams
  | AddToSelectionCommandParams
  | RemoveFromSelectionCommandParams
  | ReplaceSelectionCommandParams
  | ToggleSelectionCommandParams

export type CommandParamsOmitAffectedNodes =
  | Omit<AddObjectCommandParams, 'affectedNodes'>
  | Omit<RemoveObjectCommandParams, 'affectedNodes'>
  | Omit<DuplicateObjectCommandParams, 'affectedNodes'>
  | Omit<ModifyPropertyCommandParams<any>, 'affectedNodes'>
  | Omit<ReparentCommandParams, 'affectedNodes'>
  | Omit<GroupCommandParams, 'affectedNodes'>
  | Omit<PositionCommandParams, 'affectedNodes'>
  | Omit<RotationCommandParams, 'affectedNodes'>
  | Omit<ScaleCommandParams, 'affectedNodes'>
  | Omit<RotateAroundCommandParams, 'affectedNodes'>
  | Omit<TagComponentCommandParams, 'affectedNodes'>
  | Omit<AddToSelectionCommandParams, 'affectedNodes'>
  | Omit<RemoveFromSelectionCommandParams, 'affectedNodes'>
  | Omit<ReplaceSelectionCommandParams, 'affectedNodes'>
  | Omit<ToggleSelectionCommandParams, 'affectedNodes'>
