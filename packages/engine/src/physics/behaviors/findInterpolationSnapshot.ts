import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { InterpolatedSnapshot, Snapshot, StateEntity, StateInterEntity } from '../../networking/types/SnapshotDataTypes'

export const findInterpolationSnapshot = (
  entity: Entity,
  snapshot: Snapshot | InterpolatedSnapshot
): StateInterEntity | StateEntity => {
  const networkId = getComponent(entity, NetworkObjectComponent).networkId
  return snapshot?.state.find((v) => v.networkId == networkId)
}
