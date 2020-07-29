import { Component } from "ecsy"

// Assemblage is a pattern for creating an entity and component collection as a prototype
export interface Assemblage {
  components: {
    type: any
    data?: any
  }[]

  children?: Assemblage[]
}
