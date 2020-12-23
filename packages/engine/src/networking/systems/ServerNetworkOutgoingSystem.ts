import { isServer } from '../../common/functions/isServer';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
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
import { addNetworkTransformToWorldState } from '../functions/addNetworkTransformToWorldState';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { createSnapshot, addSnapshot } from '../functions/NetworkInterpolationFunctions';
import { WorldStateModel } from '../schema/worldStateSchema';
import { PacketReadyWorldState, WorldStateInterface, WorldStateSnapshot } from "../interfaces/WorldState";
import { NetworkSchema } from "../interfaces/NetworkSchema";

/**
 * Collects all data and send WorldState to clients
 */
export class ServerNetworkOutgoingSystem extends System {

  updateType = SystemUpdateType.Fixed;

  isServer;

  constructor(attributes: { schema: NetworkSchema, app:any }) {
    super(attributes);
    this.isServer = Network.instance.transport.isServer;
  }

  // Call execution on server
  fixedExecuteOnServer = (delta: number): void => {
    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    this.queryResults.serverNetworkTransforms.all?.forEach((entity: Entity) =>
      addNetworkTransformToWorldState(entity));

    // // For each networked object + input receiver, add to the frame to send
    // this.queryResults.serverNetworkInputs.all?.forEach((entity: Entity) =>
    //   addInputToWorldStateOnServer(entity));

    // For each networked object + input receiver, add to the frame to send
    // this.queryResults.serverNetworkStates.changed?.forEach((entity: Entity) =>
    //   addStateToWorldStateOnServer(entity));
    if (Network.instance.packetCompression) {
      const state:PacketReadyWorldState = {
        clientsConnected: [],
        clientsDisconnected: [],
        createObjects: [],
        destroyObjects: [],
        inputs: [],
        snapshot: null,
        tick: BigInt(0),
        transforms: [],
        states: []
      };

      state.clientsConnected = Network.instance.worldState.clientsConnected;
      state.clientsDisconnected = Network.instance.worldState.clientsDisconnected;
      state.createObjects = Network.instance.worldState.createObjects;
      state.destroyObjects = Network.instance.worldState.destroyObjects;
      state.transforms = Network.instance.worldState.transforms;


      state.inputs = Network.instance.worldState.inputs?.map(input => {
        return {
          networkId: input.networkId,
          axes1d: Object.keys(input.axes1d).map(v => input.axes1d[v]),
          axes2d: Object.keys(input.axes2d).map(v => input.axes2d[v]),
          buttons: Object.keys(input.buttons).map(v => input.buttons[v]),
          viewVector: { ...input.viewVector }
        };
      });

      addSnapshot(createSnapshot(Network.instance.worldState.transforms));
      Network.instance.worldState.snapshot = NetworkInterpolation.instance.get();

      state.tick = BigInt( Network.instance.worldState.tick );
      state.snapshot = {
        time: BigInt( Network.instance.worldState.snapshot.time ),
        id: Network.instance.worldState.snapshot.id,
        state: []
      }; // in client copy state from transforms

      const buffer = WorldStateModel.toBuffer(state);

      // Send the message to all connected clients
      if(Network.instance.transport !== undefined)
        Network.instance.transport.sendReliableData(buffer); // Use default channel
    } else {
      //addSnapshot(createSnapshot(Network.instance.worldState.transforms));
      Network.instance.worldState.snapshot = NetworkInterpolation.instance.get();
      Network.instance.transport.sendReliableData(Network.instance.worldState);
    }
  }

  // Call execution on client
  fixedExecuteOnClient = (delta: number): void => {
    if (Network.instance == null) return;
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0)
      applyNetworkStateToClient(queue.pop(), delta);
  }

  // Call logic based on whether we are the server or the client
  execute = isServer ? this.fixedExecuteOnServer :
    this.fixedExecuteOnClient;

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
