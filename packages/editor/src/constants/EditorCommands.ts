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
