import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { isServer } from '../../common/functions/isServer';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { addComponent, createEntity, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { InputType } from '../../input/enums/InputType';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Client } from '../components/Client';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { NetworkObject } from '../components/NetworkObject';
import { Server } from '../components/Server';
import { addInputToWorldStateOnServer } from '../functions/addInputToWorldStateOnServer';
import { addNetworkTransformToWorldState } from '../functions/addNetworkTransformToWorldState';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { handleUpdatesFromClients } from '../functions/handleUpdatesFromClients';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { sendClientInputToServer } from '../functions/sendClientInputToServer';

export class NetworkSystem extends System {
  updateType = SystemUpdateType.Network;

  isServer;

  constructor(attributes) {
    super();

    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);

    const { schema, app } = attributes;
    Network.instance.schema = schema;
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport(app);

    this.isServer = Network.instance.transport.isServer;

    // Add a component so we can filter server and client queries
    addComponent(networkEntity, this.isServer ? Server : Client);

    // Initialize the server automatically - client is initialized in connectToServer
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
    }
  }

  // Call execution on server
  fixedExecuteOnServer = (delta: number) => {
    // Server-only
    // Advance the tick on the server by one
    Network.tick++;

    let transforms = [];
    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    this.queryResults.serverNetworkTransforms.all?.forEach((entity: Entity) => {
      const transform = getComponent(entity, TransformComponent);
        transforms.push(transform);
      // transform.position.setY(Network.tick/1000);
      addNetworkTransformToWorldState(entity);
    });

    // For each networked object + input receiver, add to the frame to send
    this.queryResults.serverNetworkInputs.all?.forEach((entity: Entity) => {
      addInputToWorldStateOnServer(entity);
    });

    // TODO: Create the snapshot and add it to the world state on the server
    // addSnapshot(createSnapshot(Network.instance.worldState.transforms));

    // TODO: to enable snapshots, use worldStateModel.toBuffer(Network.instance.worldState)
    // Send the message to all connected clients
    if(Network.instance.transport !== undefined){
      Network.instance.transport.sendData(Network.instance.worldState); // Use default channel
    }

    // CClear collected world state frame and reset after calculating
    Network.instance.worldState = {
      tick: Network.tick,
      transforms: [],
      inputs: [],
      clientsConnected: [],
      clientsDisconnected: [],
      createObjects: [],
      destroyObjects: []
    };
  }

  // Call execution on client
  fixedExecuteOnClient = (delta: number) => {
    if (Network.instance == null) return
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0) {
      applyNetworkStateToClient(queue.pop(), delta);
    }
  }

  // Call logic based on whether we are the server or the client
  execute = isServer ? this.fixedExecuteOnServer :
    this.fixedExecuteOnClient;

  static queries: any = {
    networkServer: {
      components: [Network, Server]
    },
    networkClient: {
      components: [Network, Client]
    },
    localClientNetworkObjects: {
      components: [NetworkObject, Input, LocalInputReceiver]
    },
    networkStates: {
      components: [NetworkObject, State]
    },
    serverNetworkTransforms: {
      components: [NetworkObject, TransformComponent, Server]
    },
    serverNetworkObjects: {
      components: [NetworkObject, Server]
    },
    serverNetworkInputs: {
      components: [NetworkObject, Input, Server]
    },
    networkOwners: {
      components: [NetworkClient]
    }
  }
}

