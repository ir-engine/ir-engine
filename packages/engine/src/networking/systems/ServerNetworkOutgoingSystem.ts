import { CharacterComponent } from '../../character/components/CharacterComponent';
import { IKComponent } from '../../character/components/IKComponent';
import { SIXDOFType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Input } from '../../input/components/Input';
import { BaseInput } from '../../input/enums/BaseInput';
import { InputValue } from '../../input/interfaces/InputValue';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { TransformStateModel } from '../schema/transformStateSchema';
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

    const transformState = {
      tick: Network.instance.tick,
      time: Date.now(),
      transforms: [],
      ikTransforms: [],
    };

    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    this.queryResults.networkTransforms.all?.forEach((entity: Entity) => {

      const transformComponent = getComponent(entity, TransformComponent);
      const networkObject = getComponent(entity, NetworkObject);
      const currentPosition = transformComponent.position;
      const snapShotTime = networkObject.snapShotTime;

      transformState.transforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
        // TODO: reduce quaternions over network to three components
        qX: transformComponent.rotation.x,
        qY: transformComponent.rotation.y,
        qZ: transformComponent.rotation.z,
        qW: transformComponent.rotation.w
      });
    });

    this.queryResults.characterTransforms.all?.forEach((entity: Entity) => {

      const transformComponent = getComponent(entity, TransformComponent);
      const actor = getComponent(entity, CharacterComponent);
      const networkObject = getComponent(entity, NetworkObject);
      const currentPosition = transformComponent.position;
      const snapShotTime = networkObject.snapShotTime;

      transformState.transforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
        qX: actor.viewVector.x,
        qY: actor.viewVector.y,
        qZ: actor.viewVector.z,
        qW: 0 // TODO: reduce quaternions over network to three components
      });
    });

    this.queryResults.ikTransforms.all?.forEach((entity: Entity) => {

      const networkObject = getComponent(entity, NetworkObject);
      const snapShotTime = networkObject.snapShotTime;

      const input = getComponent(entity, Input);

      // we should send some default values in case the hmd or a controller has no input

      const hmd = input.data.get(BaseInput.XR_HEAD) as InputValue<SIXDOFType>;
      const left = input.data.get(BaseInput.XR_LEFT_HAND) as InputValue<SIXDOFType>;
      const right = input.data.get(BaseInput.XR_RIGHT_HAND) as InputValue<SIXDOFType>;

      if(!hmd?.value || !left?.value || !right?.value) return;

      transformState.ikTransforms.push({
        networkId: networkObject.networkId,
        snapShotTime: snapShotTime,
        hmd: hmd.value,
        left: left.value,
        right: right.value
      })
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
      const bufferReliable = WorldStateModel.toBuffer(Network.instance.worldState);
      if (!bufferReliable) {
        console.warn("World state buffer is null");
        console.warn(Network.instance.worldState);
      } else {
        if (Network.instance.transport && typeof Network.instance.transport.sendReliableData === 'function') Network.instance.transport.sendReliableData(bufferReliable);
      }

      Network.instance.worldState.clientsConnected = [];
      Network.instance.worldState.clientsDisconnected = [];
      Network.instance.worldState.createObjects = [];
      Network.instance.worldState.editObjects = [];
      Network.instance.worldState.destroyObjects = [];
      Network.instance.worldState.gameState = [];
      Network.instance.worldState.gameStateActions = [];
    }

    const bufferUnreliable = TransformStateModel.toBuffer(transformState);
    if (!bufferUnreliable) {
      console.warn("Transform buffer is null");
      console.warn(transformState);
    } else {
      if (Network.instance.transport && typeof Network.instance.transport.sendData === 'function') Network.instance.transport.sendData(bufferUnreliable);
    }
  }

  /** System queries. */
  static queries: any = {
    networkTransforms: {
      components: [Not(CharacterComponent), NetworkObject, TransformComponent]
    },
    characterTransforms: {
      components: [CharacterComponent, NetworkObject, TransformComponent]
    },
    ikTransforms: {
      components: [IKComponent, NetworkObject, TransformComponent]
    },
  }
}
