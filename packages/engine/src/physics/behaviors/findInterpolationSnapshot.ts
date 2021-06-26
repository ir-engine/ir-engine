import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { InterpolatedSnapshot, Snapshot, StateEntity, StateInterEntity } from "../../networking/types/SnapshotDataTypes";

export const findInterpolationSnapshot = (entity: Entity, snapshot: Snapshot | InterpolatedSnapshot): StateInterEntity | StateEntity => {
  const networkId = getComponent(entity, NetworkObject).networkId;
  return snapshot?.state.find(v => v.networkId == networkId);
};