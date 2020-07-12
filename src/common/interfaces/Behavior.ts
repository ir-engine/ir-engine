import { Entity } from "ecsy"

export default interface Behavior {
  (entityIn: Entity, args?: any, delta?: number, entityOut?: Entity, time?: number): void
}
