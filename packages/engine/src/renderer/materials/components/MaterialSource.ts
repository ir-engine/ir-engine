export enum SourceType {
  MODEL = 'Model',
  BUILT_IN = 'Built In',
  PROJECT = 'Project',
  EDITOR_SESSION = 'Editor Session'
}

export type MaterialSource = {
  type: SourceType
  path: string
}

export type MaterialSourceComponentType = {
  src: MaterialSource
  entries: string[]
}
