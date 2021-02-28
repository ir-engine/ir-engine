import { System } from '../../ecs/classes/System';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { EngineProxy } from '../../EngineProxy';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { WorldStateModel } from '../schema/worldStateSchema';

/** System class for network system of client. */
export class ClientNetworkSystem extends System {
  /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;

  /**
   * Constructs the system. Adds Network Components, initializes transport and initializes server.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes:{ schema: NetworkSchema, app:any }) {
    super(attributes);

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

  /**
   * Executes the system.\
   * Call logic based on whether system is on the server or on the client.
   *
   * @param delta Time since last frame.
   */
  execute = (delta: number): void => {
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0) {
      const buffer = queue.pop();
      // debugger;
      EngineProxy.instance.transferNetworkBuffer(buffer, delta);

      // const unbufferedState = WorldStateModel.fromBuffer(buffer);
      // if(!unbufferedState) console.warn("Couldn't deserialize buffer, probably still reading the wrong one")
      // if(unbufferedState) applyNetworkStateToClient(unbufferedState, delta);
    }
  }

  /** Queries for the system. */
  static queries: any = {
    clientNetworkInputReceivers: {
      components: [NetworkObject, Input, Not(LocalInputReceiver)]
    }
  }
}
