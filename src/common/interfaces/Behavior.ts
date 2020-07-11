import { Entity } from "ecsy"

export default interface Behavior {
  (entityIn: Entity, args?: any, delta?: number, time?: number, entityOut?: Entity): void
}
