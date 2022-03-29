import AddObjectCommand, { AddObjectCommandParams } from '../commands/AddObjectCommand'
import AddToSelectionCommand from '../commands/AddToSelectionCommand'
import Command from '../commands/Command'
import DuplicateObjectCommand, { DuplicateObjectCommandParams } from '../commands/DuplicateObjectCommand'
import GroupCommand, { GroupCommandParams } from '../commands/GroupCommand'
import ModifyPropertyCommand, { ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import PositionCommand, { PositionCommandParams } from '../commands/PositionCommand'
import RemoveFromSelectionCommand from '../commands/RemoveFromSelectionCommand'
import RemoveObjectsCommand, { RemoveObjectCommandParams } from '../commands/RemoveObjectsCommand'
import ReparentCommand, { ReparentCommandParams } from '../commands/ReparentCommand'
import ReplaceSelectionCommand from '../commands/ReplaceSelectionCommand'
import RotateAroundCommand, { RotateAroundCommandParams } from '../commands/RotateAroundCommand'
import RotationCommand, { RotationCommandParams } from '../commands/RotationCommand'
import ScaleCommand, { ScaleCommandParams } from '../commands/ScaleCommand'
import TagComponentCommand, { TagComponentCommandParams } from '../commands/TagComponentCommand'
import ToggleSelectionCommand from '../commands/ToggleSelectionCommand'

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

export const Commands: {
  [key: string]: typeof Command
} = {
  [EditorCommands.ADD_OBJECTS]: AddObjectCommand,
  [EditorCommands.DUPLICATE_OBJECTS]: DuplicateObjectCommand,
  [EditorCommands.REMOVE_OBJECTS]: RemoveObjectsCommand,
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
