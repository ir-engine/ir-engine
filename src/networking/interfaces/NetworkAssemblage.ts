import { Assemblage } from "../../common/interfaces/Assemblage"

export interface NetworkAssemblage extends Assemblage {
  localComponents?: {
    type: any
    data?: any
  }[]
}
