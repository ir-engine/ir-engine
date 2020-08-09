import { Entity } from "ecsy";

export interface Behavior {
  (entity: Entity, args?: any, delta?: number, entityOut?: Entity, time?: number): void
}
