import { createFixedTimestep } from '../../common/functions/Timer';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { addComponent, createEntity, getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { addNetworkTransformToWorldState } from '../behaviors/addNetworkTransformToWorldState';
import { handleUpdateFromServer } from '../behaviors/handleUpdateFromServer';
import { sendClientInput as sendClientInput } from '../behaviors/sendClientInput';
import { sendSnapshotToClients } from '../behaviors/sendSnapshotToClients';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { NetworkObject } from '../components/NetworkObject';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { prepareWorldState } from '../functions/prepareWorldState';
import { initializeNetworkObject } from './initializeNetworkObject';
import { destroyNetworkObject } from './destroyNetworkObject';

export class NetworkSystem extends System {
  fixedExecute: (delta: number) => void = null

  constructor() {
    super()
    // TODO: Move network timestep to config
    this.fixedExecute = createFixedTimestep(30, this.onFixedExecute.bind(this))
  }

  init(attributes) {
    const { schema } = attributes
    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);
    // Late initialization of network
    Network.instance.schema = schema;
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new (schema.transport)();

    // Initialize the server automatically
    if (process.env.SERVER_MODE != undefined && process.env.SERVER_MODE !== 'client') {
      Network.instance.transport.initialize();
    }
  }

  execute(delta): void {
    if (!Network.instance.isInitialized) return

    this.queryResults.networkTransforms.changed?.forEach((entity: Entity) =>
      addNetworkTransformToWorldState(entity)
    )

    this.fixedExecute(delta)
  }

  onFixedExecute(delta) {
    // Advance the network tick
    Network.tick++

    // Client only
    if (!Network.instance.transport.isServer) {
      this.queryResults.networkInputSender.all?.forEach((entity: Entity) =>
        sendClientInput(entity)
      )

      // Handle incoming world state and interpolate transforms
      this.queryResults.network.all?.forEach((entity: Entity) =>
        handleUpdateFromServer(entity)
      )
    }

    // Server-only
    if (Network.instance.transport.isServer) {
      prepareWorldState()

      // handle client input and apply to network objects


      // 



      addSnapshot(createSnapshot(Network.instance.worldState))

      // Send all queued messages
      this.queryResults.network.all?.forEach((entity: Entity) =>
        sendSnapshotToClients(entity)
      )
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

