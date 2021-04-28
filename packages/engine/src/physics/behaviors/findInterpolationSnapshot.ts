import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { InterpolatedSnapshot, Snapshot } from "../../networking/types/SnapshotDataTypes";


export const findInterpolationSnapshot = (entity: Entity, snapshot: Snapshot | InterpolatedSnapshot) => {
  return snapshot?.state.find(v => v.networkId == getComponent(entity, NetworkObject).networkId);
}
