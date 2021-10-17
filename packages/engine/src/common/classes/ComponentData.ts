// Interface to provide basic functions to Componet data
export interface ComponentData {
  serialize(): object
  serializeToJSON(): string
  deserialize?(props: any): ComponentData
  deserializeFromJSON?(json: string): ComponentData
  canBeAdded?(): boolean
}
