export type MaterialSource = {
  type: 'Model' | 'Built In' | 'Project' | 'Editor Session'
  path: string
}

export type MaterialSourceComponentType = {
  src: MaterialSource
  entries: string[]
}
