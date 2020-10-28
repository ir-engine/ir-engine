import isNullOrUndefined from '../../common/functions/isNullOrUndefined';
import { createFixedTimestep } from '../../common/functions/Timer';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { NetworkObject } from '../components/NetworkObject';
import { addInputToWorldStateOnServer } from '../functions/addInputToWorldStateOnServer';
import { addNetworkTransformToWorldState } from '../functions/addNetworkTransformToWorldState';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { handleUpdateFromServer } from '../functions/handleUpdateFromServer';
import { handleUpdatesFromClients } from '../functions/handleUpdatesFromClients';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { prepareWorldState as prepareWorldState } from '../functions/prepareWorldState';
import { sendClientInput as sendClientInputToServer } from '../functions/sendClientInput';

export class NetworkSystem extends System {


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

    // Initialize the server automatically - client is initialized in connectToServer
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
    }
  }

  execute(delta): void {
    this.fixedExecute(delta);
  }

  fixedExecute = (delta: number) => {
    // Client logic
    if (!isNullOrUndefined(Network.instance) && !Network.instance.transport.isServer) {
      const queue = Network.instance.incomingMessageQueue;
      // For each message, handle and process
      while (queue.getBufferLength() > 0) {
        applyNetworkStateToClient(queue.pop(), delta);
      }

      // Client sends input and *only* input to the server (for now)
      this.queryResults.localClientNetworkObjects.all?.forEach((entity: Entity) => {
        sendClientInputToServer(entity);
      }
      );
    }

    // Server-only
    if (Network.instance?.transport.isServer) {
      // Advance the tick on the server by one
      Network.tick++;

      // Create a new empty world state frame to be sent to clients
      prepareWorldState();

      // Transforms that are updated are automatically collected
      // note: onChanged needs to currently be handled outside of fixedExecute
      this.queryResults.serverNetworkTransforms.all?.forEach((entity: Entity) => {
        console.log("Adding transform to world state")
        addNetworkTransformToWorldState(entity)
      }
      );

      // handle client input, apply to local objects and add to world state snapshot
      handleUpdatesFromClients();

      // Note: Transforms that are updated get added to world state frame in execute since they use added hook
      // When that is fixed, we should move from execute to here

      // For each networked object + input receiver, add to the frame to send
      this.queryResults.serverNetworkInputs.all?.forEach((entity: Entity) => {
        addInputToWorldStateOnServer(entity);
      });

      // TODO: Create the snapshot and add it to the world state on the server
      // addSnapshot(createSnapshot(Network.instance.worldState.transforms));

      // TODO: to enable snapshots, use worldStateModel.toBuffer(Network.instance.worldState)
      // Send the message to all connected clients
      Network.instance.transport.sendReliableData(Network.instance.worldState); // Use default channel
    }
  }

  static queries: any = {
    network: {
      components: [Network]
    },
    networkInterpolation: {
      components: [NetworkInterpolation]
    },
    clientNetworkObjects: {
      components: [NetworkObject, Input, Not(LocalInputReceiver)]
    },
    localClientNetworkObjects: {
      components: [NetworkObject, Input, LocalInputReceiver]
    },
    networkStates: {
      components: [NetworkObject, State]
    },
    serverNetworkTransforms: {
      components: [NetworkObject, TransformComponent]
    },
    serverNetworkInputs: {
      components: [NetworkObject, Input]
    },
    networkOwners: {
      components: [NetworkClient]
    }
  }
}

