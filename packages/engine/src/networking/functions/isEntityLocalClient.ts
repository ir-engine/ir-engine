import { Entity } from "../../ecs/classes/Entity"
import { Network } from "../classes/Network"

export const isEntityLocalClient = (entity: Entity) => {
  return Network.instance.localClientEntity && Network.instance.localClientEntity === entity;
}