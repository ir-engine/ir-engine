import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { System, SystemAttributes } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Network } from '../classes/Network';
import { WorldStateModel } from '../schema/worldStateSchema';

/** System class for network system of client. */
export class ClientNetworkSystem extends System {

  static EVENTS = {
    CONNECT: 'CLIENT_NETWORK_SYSTEM_CONNECT',
    SEND_DATA: 'CLIENT_NETWORK_SYSTEM_SEND_DATA',
    RECEIVE_DATA: 'CLIENT_NETWORK_SYSTEM_RECEIVE_DATA',
    CONNECTION_LOST: 'CORE_CONNECTION_LOST',
  }
  /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;

  /**
   * Constructs the system. Adds Network Components, initializes transport and initializes server.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    
    const { schema } = attributes;

    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport();

    EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.SEND_DATA, ({ buffer }) => {
      Network.instance.transport.sendReliableData(buffer);
      // Network.instance.transport.sendData(buffer);
    });
  }

  dispose() {
    EngineEvents.instance.removeAllListenersForEvent(ClientNetworkSystem.EVENTS.SEND_DATA);
  }

  /**
   * Executes the system.
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
      let unbufferedState;
      try {
        unbufferedState = WorldStateModel.fromBuffer(buffer);
        if(!unbufferedState) throw new Error("Couldn't deserialize buffer, probably still reading the wrong one");
        EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.RECEIVE_DATA, unbufferedState, delta });
      } catch (e) {
        console.log(e);
      }
    }
  }

  /** Queries for the system. */
  static queries: any = {}
}
