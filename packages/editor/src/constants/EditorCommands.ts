import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'

import { AddObjectCommand, AddObjectCommandParams } from '../commands/AddObjectCommand'
import { AddToSelectionCommand, AddToSelectionCommandParams } from '../commands/AddToSelectionCommand'
import { DuplicateObjectCommand, DuplicateObjectCommandParams } from '../commands/DuplicateObjectCommand'
import { GroupCommand, GroupCommandParams } from '../commands/GroupCommand'
import { ModifyMaterialCommand, ModifyMaterialCommandParams } from '../commands/ModifyMaterialCommand'
import { ModifyObj3DCommandParams } from '../commands/ModifyObject3DCommand'
import { ModifyObj3DCommand } from '../commands/ModifyObject3DCommand'
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
  ADD_OBJECTS = 'ADD_OBJECTS',
  REMOVE_OBJECTS = 'REMOVE_OBJECTS',
  DUPLICATE_OBJECTS = 'DUPLICATE_OBJECTS',
  MODIFY_PROPERTY = 'MODIFY_PROPERTY'
}

export enum SelectionCommands {
  ADD_TO_SELECTION = 'ADD_TO_SELECTION',
  REMOVE_FROM_SELECTION = 'REMOVE_FROM_SELECTION',
  TOGGLE_SELECTION = 'TOGGLE_SELECTION',
  REPLACE_SELECTION = 'REPLACE_SELECTION'
}

export enum ParentCommands {
  REPARENT = 'REPARENT',
  GROUP = 'GROUP'
}

export enum TransformCommands {
  POSITION = 'POSITION',
  ROTATION = 'ROTATION',
  SCALE = 'SCALE',
  ROTATE_AROUND = 'ROTATE_AROUND'
}

export enum MiscCommands {
  TAG_COMPONENT = 'TAG_COMPONENT',
  MODIFY_OBJECT3D = 'MODIFY_OBJECT3D',
  MODIFY_MATERIAL = 'MODIFY_MATERIAL'
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
  [EditorCommands.TAG_COMPONENT]: TagComponentCommand,
  [EditorCommands.MODIFY_OBJECT3D]: ModifyObj3DCommand,
  [EditorCommands.MODIFY_MATERIAL]: ModifyMaterialCommand
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
  | ModifyObj3DCommandParams
  | ModifyMaterialCommandParams

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
  | Omit<ModifyObj3DCommandParams, 'affectedNodes'>
  | Omit<ModifyMaterialCommandParams, 'affectedNodes'>
