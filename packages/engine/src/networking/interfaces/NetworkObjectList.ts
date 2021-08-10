import { Entity } from '../../ecs/classes/Entity'

/** Interface for holding Network Object. */
export interface NetworkObjectList {
  /** Key is network ID. */
  [key: number]: {
    /** Owner's socket ID. */
    ownerId: string
    /** All network objects need to be a registered prefab. */
    prefabType: number
    /** The parameters by which the prefab was created */
    parameters: any
    /** Container for {@link networking/components/NetworkObject.NetworkObject | NetworkObject} component. */
    entity: Entity
    /** its needs to correct network id in clients by loading models get same id like in server */
    uniqueId: string
  }
}
