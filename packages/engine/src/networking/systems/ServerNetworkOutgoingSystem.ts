import { IKAvatarRig } from '../../avatar/components/IKAvatarRig';
import { SIXDOFType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Input } from '../../input/components/Input';
import { BaseInput } from '../../input/enums/BaseInput';
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
      const currentPosition = transformComponent.position;
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

      const avatarRig = getComponent(entity, IKAvatarRig)
      const input = getMutableComponent(entity, Input);

      const head = input.data.get(BaseInput.XR_HEAD)?.value as SIXDOFType;
      const left = input.data.get(BaseInput.XR_LEFT_HAND)?.value as SIXDOFType;
      const right = input.data.get(BaseInput.XR_RIGHT_HAND)?.value as SIXDOFType;

      if(avatarRig && head && left && right) {
        Network.instance.worldState.ikTransforms.push({
          networkId: networkObject.networkId,
          snapShotTime: snapShotTime,
          hmd: {
            x: head.x,
            y: head.y,
            z: head.z,
            qW: head.qW,
            qX: head.qX,
            qY: head.qY,
            qZ: head.qZ,
          },
          left: {
            x: left.x,
            y: left.y,
            z: left.z,
            qW: left.qW,
            qX: left.qX,
            qY: left.qY,
            qZ: left.qZ
          },
          right: {
            x: right.x,
            y: right.y,
            z: right.z,
            qW: right.qW,
            qX: right.qX,
            qY: right.qY,
            qZ: right.qZ
          },
        })
      }
    });

    // TODO: split reliable and unreliable into seperate schemas
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
