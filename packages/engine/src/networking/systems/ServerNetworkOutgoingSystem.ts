import { isServer } from '../../common/functions/isServer';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Client } from '../components/Client';
import { Network } from '../components/Network';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { NetworkObject } from '../components/NetworkObject';
import { Server } from '../components/Server';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { PacketWorldState } from "../interfaces/WorldState";
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
  /** Whether the system is server or client. */
  isServer;

  /**
   * Constructs the system.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: { schema: NetworkSchema, app:any }) {
    super(attributes);
    this.isServer = Network.instance.transport.isServer;
  }

  /** Call execution on server */
  fixedExecuteOnServer = (delta: number): void => {
    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    this.queryResults.serverNetworkTransforms.all?.forEach((entity: Entity) =>
      addNetworkTransformToWorldState(entity));
/*
      if (Network.instance.worldState.transforms.length === 0 &&
          Network.instance.worldState.inputs.length === 0 &&
          Network.instance.worldState.clientsConnected.length === 0 &&
          Network.instance.worldState.clientsDisconnected.length === 0 &&
          Network.instance.worldState.createObjects.length === 0 &&
          Network.instance.worldState.destroyObjects.length === 0) return;
*/
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

  /** Call execution on client */
  fixedExecuteOnClient = (delta: number): void => {
    if (Network.instance == null) return;
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0)
      applyNetworkStateToClient(queue.pop(), delta);
  }

  /** Call logic based on whether system is on the server or on the client. */
  execute = isServer ? this.fixedExecuteOnServer :
    this.fixedExecuteOnClient;

  /** System queries. */
  static queries: any = {
    inputOnServer: {
      components: [NetworkObject, Input, Server],
      listen: {
        added: true,
        removed: true
      }
    },
    networkServer: {
      components: [Network, Server]
    },
    networkClient: {
      components: [Network, Client]
    },
    localClientNetworkInputReceivers: {
      components: [NetworkObject, Input, LocalInputReceiver]
    },
    serverNetworkStates: {
      components: [NetworkObject, State, Server]
    },
    serverNetworkTransforms: {
      components: [NetworkObject, TransformComponent, Server]
    },
    serverNetworkObjects: {
      components: [NetworkObject, Server]
    },
    serverNetworkInputs: {
      components: [NetworkObject, Input, Server]
    }
  }
}
