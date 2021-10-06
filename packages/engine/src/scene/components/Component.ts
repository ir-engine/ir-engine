// Interface to provide basic functions to Componet data
export interface Component {
  serialize(): object
  serializeToJSON(): string
  deserialize(props: any): Component
  deserializeFromJSON(json: string): Component
}
