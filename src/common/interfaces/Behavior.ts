import { Entity } from "ecsy"

export default interface Behavior {
  (entityIn: Entity, args?: any, entityOut?: Entity, delta?: number, time?: number): void
}
