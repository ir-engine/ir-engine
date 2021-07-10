import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { Network } from '../classes/Network'
import { TransformStateModel } from '../schema/transformStateSchema'
import { WorldStateModel } from '../schema/worldStateSchema'

/** System class for network system of client. */
export class ClientNetworkSystem extends System {
  static EVENTS = {
    CONNECT: 'CLIENT_NETWORK_SYSTEM_CONNECT',
    SEND_DATA: 'CLIENT_NETWORK_SYSTEM_SEND_DATA',
    RECEIVE_DATA_UNRELIABLE: 'CLIENT_NETWORK_SYSTEM_RECEIVE_DATA_UNRELIABLE',
    RECEIVE_DATA_RELIABLE: 'CLIENT_NETWORK_SYSTEM_RECEIVE_DATA_RELIABLE',
    CONNECTION_LOST: 'CORE_CONNECTION_LOST'
  }
  /** Update type of this system. **Default** to
   * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed

  /**
   * Constructs the system. Adds Network Components, initializes transport and initializes server.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes)

    const { schema } = attributes

    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport()

    EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.SEND_DATA, ({ buffer }) => {
      if (Network.instance.transport && typeof Network.instance.transport.sendReliableData === 'function')
        Network.instance.transport.sendReliableData(buffer)
    })
  }

  dispose() {
    EngineEvents.instance.removeAllListenersForEvent(ClientNetworkSystem.EVENTS.SEND_DATA)
  }

  /**
   * Executes the system.
   * Call logic based on whether system is on the server or on the client.
   *
   * @param delta Time since last frame.
   */
  execute = (delta: number): void => {
    // Client logic
    const reliableQueue = Network.instance.incomingMessageQueueReliable
    // For each message, handle and process
    while (reliableQueue.getBufferLength() > 0) {
      const buffer = reliableQueue.pop()
      try {
        const worldState = WorldStateModel.fromBuffer(buffer)
        if (!worldState) throw new Error("Couldn't deserialize buffer, probably still reading the wrong one")
        EngineEvents.instance.dispatchEvent({
          type: ClientNetworkSystem.EVENTS.RECEIVE_DATA_RELIABLE,
          worldState,
          delta
        })
      } catch (e) {
        console.log(e)
      }
    }

    const unreliableQueue = Network.instance.incomingMessageQueueUnreliable
    while (unreliableQueue.getBufferLength() > 0) {
      const buffer = unreliableQueue.pop()
      try {
        const transformState = TransformStateModel.fromBuffer(buffer)
        if (!transformState) throw new Error("Couldn't deserialize buffer, probably still reading the wrong one")
        EngineEvents.instance.dispatchEvent({
          type: ClientNetworkSystem.EVENTS.RECEIVE_DATA_UNRELIABLE,
          transformState,
          delta
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  /** Queries for the system. */
  static queries: any = {}
}
