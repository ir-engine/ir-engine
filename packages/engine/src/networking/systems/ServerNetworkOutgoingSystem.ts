import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { WorldStateModel } from '../schema/worldStateSchema';

/**
 * Push transformation of network to world state.
 * @param entity Entity holding network component.
 */
const addNetworkTransformToWorldState: Behavior = (entity) => {
  const transformComponent = getComponent(entity, TransformComponent);
  const networkObject = getComponent(entity, NetworkObject);

  let snapShotTime = 0
  if (networkObject.snapShotTime != undefined) {
    snapShotTime = networkObject.snapShotTime;
  }

  Network.instance.worldState.transforms.push({
      networkId: networkObject.networkId,
      snapShotTime: snapShotTime,
      x: transformComponent.position.x,
      y: transformComponent.position.y,
      z: transformComponent.position.z,
      qX: transformComponent.rotation.x,
      qY: transformComponent.rotation.y,
      qZ: transformComponent.rotation.z,
      qW: transformComponent.rotation.w
  });
};

/** System class to handle outgoing messages. */
export class ServerNetworkOutgoingSystem extends System {
  /** Update type of this system. **Default** to
   * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;

  /**
   * Constructs the system.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: { schema: NetworkSchema, app:any }) {
    super(attributes);
  }

  /** Call execution on server */
  execute = (delta: number): void => {
    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    this.queryResults.networkTransforms.all?.forEach((entity: Entity) =>
      addNetworkTransformToWorldState(entity));
      const buffer = WorldStateModel.toBuffer(Network.instance.worldState);
      // Send the message to all connected clients
      if(Network.instance.transport !== undefined){
        try{
          Network.instance.transport.sendReliableData(buffer); // Use default channel
        } catch (error){
          console.warn("Couldn't send data, error")
          console.warn(error)
        }
      }
  }

  /** System queries. */
  static queries: any = {
    networkTransforms: {
      components: [NetworkObject, TransformComponent]
    },
  }
}
