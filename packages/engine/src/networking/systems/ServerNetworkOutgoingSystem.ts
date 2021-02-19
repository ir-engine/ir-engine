import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { WorldStateModel } from '../schema/worldStateSchema';

/** System class to handle outgoing messages. */
export class ServerNetworkOutgoingSystem extends System {
  /** Update type of this system. **Default** to
   * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;

  /**
   * Constructs the system.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: { schema: NetworkSchema, app: any }) {
    super(attributes);
  }

  /** Call execution on server */
  execute = (delta: number): void => {
    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    this.queryResults.networkTransforms.all?.forEach((entity: Entity) => {
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
    });
    if(Network.instance.worldState.editObjects.length) {
      console.warn(Network.instance.worldState.editObjects);
    }

    if (
      Network.instance.worldState.clientsConnected.length ||
      Network.instance.worldState.clientsDisconnected.length ||
      Network.instance.worldState.createObjects.length ||
      Network.instance.worldState.editObjects.length ||
      Network.instance.worldState.destroyObjects.length
    ) {
      const bufferReliable = WorldStateModel.toBuffer(Network.instance.worldState, 'Reliable');
      Network.instance.transport.sendReliableData(bufferReliable);
      const bufferUnReliable = WorldStateModel.toBuffer(Network.instance.worldState, 'UnReliable');
      //console.warn(bufferUnReliable.byteLength);
      try {
        Network.instance.transport.sendData(bufferUnReliable);
      } catch (error) {
        console.warn("Couldn't send data: ", error)
      }
    } else {
      const bufferUnReliable = WorldStateModel.toBuffer(Network.instance.worldState, 'UnReliable');
      try {
        Network.instance.transport.sendData(bufferUnReliable);
      } catch (error) {
        console.warn("Couldn't send data: ", error)
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
