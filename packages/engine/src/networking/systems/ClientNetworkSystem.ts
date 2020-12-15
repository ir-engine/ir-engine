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
import { worldStateModel } from '../schema/worldStateSchema';

export class ClientNetworkSystem extends System {
  updateType = SystemUpdateType.Fixed;

  constructor(attributes:{ schema: NetworkSchema, app:any }) {
    super();

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
  execute = (delta: number) => {
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0) {
      const buffer = queue.pop();
      // debugger;
      if (Network.instance.packetCompression) {
        const state = worldStateModel.fromBuffer(new Uint8Array(buffer).buffer)
        //@ts-ignore
        state.snapshot.time = parseInt(state.snapshot.time);
        //@ts-ignore
        state.tick = parseInt(state.tick);
        //@ts-ignore
        state.snapshot.state = state.transforms;
        //@ts-ignore
        applyNetworkStateToClient(state, delta);
      } else {
        applyNetworkStateToClient(buffer, delta);
      }

    }

      this.queryResults.clientNetworkInputReceivers.all?.forEach((entity) => {
        // Call behaviors on map
        handleInputOnServer(entity, {isLocal:false, isServer: false}, delta);
      })
  }

  static queries: any = {
    clientNetworkInputReceivers: {
      components: [NetworkObject, Input, Not(LocalInputReceiver)]
    }
  }
}
