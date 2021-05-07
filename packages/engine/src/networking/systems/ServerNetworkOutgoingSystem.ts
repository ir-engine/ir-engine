import { IKComponent } from '../../character/components/IKComponent';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { WorldStateModel } from '../schema/worldStateSchema';
import { ControllerColliderComponent } from '../../physics/components/ControllerColliderComponent';
import { CharacterComponent } from '../../character/components/CharacterComponent';

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
      const currentPosition = getComponent(entity, CharacterComponent)?.actorCapsule.controller.transform.translation ?? transformComponent.position;
      const snapShotTime = networkObject.snapShotTime ?? 0;


      Network.instance.worldState.transforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
        qX: transformComponent.rotation.x,
        qY: transformComponent.rotation.y,
        qZ: transformComponent.rotation.z,
        qW: transformComponent.rotation.w
      });

      const ikComponent = getComponent(entity, IKComponent)
      if(ikComponent) {
        const transforms = ikComponent.avatarIKRig.inputs
        Network.instance.worldState.ikTransforms.push({
          networkId: networkObject.networkId,
          snapShotTime: snapShotTime,
          hmd: {
            x: transforms.hmd.position.x,
            y: transforms.hmd.position.y,
            z: transforms.hmd.position.z,
            qW: transforms.hmd.quaternion.w,
            qX: transforms.hmd.quaternion.x,
            qY: transforms.hmd.quaternion.y,
            qZ: transforms.hmd.quaternion.z,
          },
          left: {
            x: transforms.leftGamepad.position.x,
            y: transforms.leftGamepad.position.y,
            z: transforms.leftGamepad.position.z,
            qW: transforms.leftGamepad.quaternion.w,
            qX: transforms.leftGamepad.quaternion.x,
            qY: transforms.leftGamepad.quaternion.y,
            qZ: transforms.leftGamepad.quaternion.z,
          },
          right: {
            x: transforms.rightGamepad.position.x,
            y: transforms.rightGamepad.position.y,
            z: transforms.rightGamepad.position.z,
            qW: transforms.rightGamepad.quaternion.w,
            qX: transforms.rightGamepad.quaternion.x,
            qY: transforms.rightGamepad.quaternion.y,
            qZ: transforms.rightGamepad.quaternion.z,
          },
        })
      }
    });

    if (
      Network.instance.worldState.clientsConnected.length ||
      Network.instance.worldState.clientsDisconnected.length ||
      Network.instance.worldState.createObjects.length ||
      Network.instance.worldState.editObjects.length ||
      Network.instance.worldState.destroyObjects.length ||
      Network.instance.worldState.gameState.length ||
      Network.instance.worldState.gameStateActions.length
    ) {
      const bufferReliable = WorldStateModel.toBuffer(Network.instance.worldState, 'Reliable');
      if(!bufferReliable){
        console.warn("Reliable buffer is null");
        console.warn(Network.instance.worldState);
      }
            else
      Network.instance.transport.sendReliableData(bufferReliable);
    }

    const bufferUnreliable = WorldStateModel.toBuffer(Network.instance.worldState, 'Unreliable');
    try {
      Network.instance.transport.sendData(bufferUnreliable);
    } catch (error) {
      console.warn("Couldn't send data: ", error)
    }
  }

  /** System queries. */
  static queries: any = {
    networkTransforms: {
      components: [ NetworkObject, TransformComponent ] // CharacterComponent ? we sent double to network objects to ?
    },
  }
}
