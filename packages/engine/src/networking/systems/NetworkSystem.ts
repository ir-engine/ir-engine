import { createFixedTimestep } from '../../common/functions/Timer';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { addInputToWorldState } from '../behaviors/addInputToWorldState';
import { addNetworkTransformToWorldState } from '../behaviors/addNetworkTransformToWorldState';
import { handleUpdateFromServer } from '../behaviors/handleUpdateFromServer';
import { sendClientInput as sendClientInputToServer } from '../behaviors/sendClientInput';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { NetworkObject } from '../components/NetworkObject';
import { handleUpdatesFromClients } from '../functions/handleUpdatesFromClients';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { prepareWorldState as prepareServerWorldState } from '../functions/prepareWorldState';
import { worldStateModel } from '../schema/worldStateSchema';

export class NetworkSystem extends System {
  fixedExecute: (delta: number) => void = null

  constructor(attributes) {
    super()

    console.log("Constructing network system")

    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);
    // Late initialization of network
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)

    const { schema, agonesSDK } = attributes
    Network.instance.schema = schema;
    Network.instance.transport = new (schema.transport)();

    console.log("Server mode is: " + process.env.SERVER_MODE )
    // Initialize the server automatically
    if (process.env.SERVER_MODE === 'realtime') {
        Network.instance.transport.initialize()
        Network.instance.isInitialized = true
    }
    console.log("NetworkSystem ready, run connectToServer to... connect to the server!")

    // TODO: Move network timestep (30) to config
    this.fixedExecute = createFixedTimestep(30, this.onFixedExecute.bind(this))
  }

  execute(delta): void {
    // Transforms that are updated are automatically collected
    // note: onChanged needs to currently be handled outside of fixedExecute
    if (Network.instance.transport.isServer)
      this.queryResults.networkTransforms.changed?.forEach((entity: Entity) =>
        addNetworkTransformToWorldState(entity)
      )

    this.fixedExecute(delta)
  }

  onFixedExecute(delta) {
    console.log(Network.tick)
    // Advance the network tick

    // Client only
    if (!Network.instance.transport.isServer) {

      // Client sends input and *only* input to the server (for now)
      this.queryResults.networkInputSender.all?.forEach((entity: Entity) =>
        sendClientInputToServer(entity)
      )

      // Client handles incoming input from other clients and interpolates transforms
      this.queryResults.network.all?.forEach((entity: Entity) =>
        handleUpdateFromServer(entity)
      )
    }

    // Server-only
    if (Network.instance.transport.isServer) {
      Network.tick++

      // Create a new empty world state frame to be sent to clients
      prepareServerWorldState()

      // handle client input, apply to local objects and add to world state snapshot
      handleUpdatesFromClients()

      // Note: Transforms that are updated get added to world state frame in execute since they use added hook
      // When that is fixed, we should move from execute to here

      // For each networked object + input receiver, add to the frame to send
      this.queryResults.networkInput.all?.forEach((entity: Entity) => {
        addInputToWorldState(entity)
      })

      // Create the snapshot and add it to the world state on the server
      addSnapshot(createSnapshot(Network.instance.worldState))

      console.log("Sending worldstate")

      // Send the message to all connected clients
      Network.instance.transport.sendData(worldStateModel.toBuffer(Network.instance.worldState)); // Use default channel
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
    networkInput: {
      components: [NetworkObject, Input, Not(LocalInputReceiver)]
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

