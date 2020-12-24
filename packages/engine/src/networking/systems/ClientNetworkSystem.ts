import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { Client } from '../components/Client';
import { Network } from '../components/Network';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { Vault } from '../components/Vault';
import { NetworkObject } from '../components/NetworkObject';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { handleInputOnServer } from '../functions/handleInputOnServer';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { WorldStateModel } from '../schema/worldStateSchema';
import { PacketReadyWorldState, WorldStateInterface } from "../interfaces/WorldState";
import { snapshot } from "../functions/NetworkInterpolationFunctions";

export class ClientNetworkSystem extends System {
  updateType = SystemUpdateType.Fixed;

  constructor(attributes:{ schema: NetworkSchema, app:any }) {
    super(attributes);

    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);
    addComponent(networkEntity, Vault);

    const { schema, app } = attributes;
    Network.instance.schema = schema;
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport(app);

    // Add a component so we can filter server and client queries
    addComponent(networkEntity, Client);

    // Initialize the server automatically - client is initialized in connectToServer
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
    }
  }

  // Call logic based on whether we are the server or the client
  execute = (delta: number): void => {
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0) {
      const buffer = queue.pop();
      // debugger;
      if (Network.instance.packetCompression) {
        const state = WorldStateModel.fromBuffer(new Uint8Array(buffer).buffer);
        // TODO: get rid of this conversions? isn't it lossy converting bigint to number and back?
        const state2:WorldStateInterface = {
          ...state,
          tick: Number(state.tick),
          snapshot: {
            ...state.snapshot,
            time: Number(state.snapshot.time),
            state: state.transforms
          }
        };

        applyNetworkStateToClient(state2, delta);
      } else {
        applyNetworkStateToClient(buffer, delta);
      }

    }

    this.queryResults.clientNetworkInputReceivers.all?.forEach((entity) => {
      // Call behaviors on map
      handleInputOnServer(entity, {isLocal:false, isServer: false}, delta);
    });
  }

  static queries: any = {
    clientNetworkInputReceivers: {
      components: [NetworkObject, Input, Not(LocalInputReceiver)]
    }
  }
}
