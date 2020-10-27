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
import { addInputToWorldState } from '../functions/addInputToWorldState';
import { addNetworkTransformToWorldState } from '../functions/addNetworkTransformToWorldState';
import { handleUpdateFromServer } from '../functions/handleUpdateFromServer';
import { handleUpdatesFromClients } from '../functions/handleUpdatesFromClients';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { prepareWorldState as prepareServerWorldState } from '../functions/prepareWorldState';
import { sendClientInput as sendClientInputToServer } from '../functions/sendClientInput';

export class NetworkSystem extends System {
  fixedExecute: (delta: number) => void = null

  constructor(attributes) {
    super();

    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);
    // Late initialization of network
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)

    const { schema, app } = attributes;
    Network.instance.schema = schema;
    Network.instance.transport = new schema.transport(app);

    // Initialize the server automatically
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
        console.log("Initializing");
      Network.instance.transport.initialize();
        Network.instance.isInitialized = true;
    }

    prepareServerWorldState();

    // TODO: Move network timestep (30) to config
    this.fixedExecute = createFixedTimestep(30, this.onFixedExecute.bind(this));
  }

  execute(delta): void {


    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
      this.queryResults.networkTransforms.changed?.forEach((entity: Entity) => {
        console.log("Adding transform to world state")
        addNetworkTransformToWorldState(entity)
      }
      );

    this.fixedExecute(delta);
  }

  onFixedExecute(delta) {
    // Advance the network tick

    // Client only
    if (!Network.instance?.transport.isServer) {
      // Client sends input and *only* input to the server (for now)
      this.queryResults.networkInputSender.all?.forEach((entity: Entity) => {
        sendClientInputToServer(entity);
      }
      );
      // Client handles incoming input from other clients and interpolates transforms
      this.queryResults.network.all?.forEach((entity: Entity) => {
        handleUpdateFromServer(entity);
      });
    }

    // Server-only
    if (Network.instance?.transport.isServer) {
      Network.tick++;

      // handle client input, apply to local objects and add to world state snapshot
      handleUpdatesFromClients();

      // Note: Transforms that are updated get added to world state frame in execute since they use added hook
      // When that is fixed, we should move from execute to here

      // For each networked object + input receiver, add to the frame to send
      this.queryResults.networkInputsToServer.all?.forEach((entity: Entity) => {
        addInputToWorldState(entity);
      });

      // Create the snapshot and add it to the world state on the server
      addSnapshot(createSnapshot(Network.instance.worldState.transforms));

      const ws = Network.instance.worldState; // worldStateModel.toBuffer(Network.instance.worldState)
      // Send the message to all connected clients
      Network.instance.transport.sendReliableData(ws); // Use default channel

        // Create a new empty world state frame to be sent to clients
        prepareServerWorldState();
    }
  }

  static queries: any = {
    network: {
      components: [Network]
    },
    networkInterpolation: {
      components: [NetworkInterpolation]
    },
    networkObjects: {
      components: [NetworkObject]
    },
    networkInputsToServer: {
      components: [NetworkObject, Input]
    },
    networkInputSender: {
      components: [NetworkObject, Input, LocalInputReceiver]
    },
    networkStates: {
      components: [NetworkObject, State]
    },
    networkTransforms: {
      components: [NetworkObject, TransformComponent]
    },
    networkOwners: {
      components: [NetworkClient]
    }
  }
}

