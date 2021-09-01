import { Schema } from '../../assets/superbuffer'
import { RingBuffer } from '../../common/classes/RingBuffer'
import { Entity } from '../../ecs/classes/Entity'
import { NetworkObjectList } from '../interfaces/NetworkObjectList'
import { NetworkSchema } from '../interfaces/NetworkSchema'
import { NetworkTransport, ActionType } from '../interfaces/NetworkTransport'
import { AvatarProps, NetworkClientInputInterface, WorldStateInterface } from '../interfaces/WorldState'
import { Snapshot } from '../types/SnapshotDataTypes'
import SocketIO from 'socket.io'
import { sendChatMessage } from '../../../../client-core/src/social/reducers/chat/service'
import { User } from '../../../../common/src/interfaces/User'
import Store from '../../../../client-core/src/store'

export interface NetworkClientList {
  // Key is socket ID
  [key: string]: {
    userId?: string
    name?: string
    socket?: SocketIO.Socket
    socketId?: string
    lastSeenTs?: any
    joinTs?: any
    media?: {}
    consumerLayers?: {}
    stats?: {}
    instanceSendTransport?: any
    instanceRecvTransport?: any
    channelSendTransport?: any
    channelRecvTransport?: any
    dataConsumers?: Map<string, any> // Key => id of data producer
    dataProducers?: Map<string, any> // Key => label of data channel}
    avatarDetail?: AvatarProps
    networkId?: any // to easily retrieve the network object correspending to this client
    subscribedChatUpdates: string[]
  }
}

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network = null

  /** Indication of whether the network is initialized or not. */
  isInitialized: boolean
  /** Whether to apply compression on packet or not. */
  packetCompression = true
  /** we dont senr unit64 now, then its a value to -minus from time to get a little value for unit32 */
  timeSnaphotCorrection = Date.now()
  /** Object holding transport details over network. */
  transport: NetworkTransport
  /** Network transports. */
  transports = []
  /** Schema of the component. */
  schema: NetworkSchema
  /** Clients connected over this network. */
  clients: NetworkClientList = {}
  /** List of data producer nodes. */
  dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  dataConsumers = new Map<string, any>()
  /** Incoming actions */
  incomingActions = [] as ActionType[]
  /** Outgoing actions */
  outgoingActions = [] as ActionType[]

  /** Map of Network Objects. */
  networkObjects: NetworkObjectList = {}
  localClientEntity: Entity = null
  /** Socket id of the network instance connection. */
  instanceSocketId: string
  /** Socket id of the network channel connection. */
  channelSocketId: string
  /** User id hosting this network. */
  userId: string
  /** Access tocken of the User. */
  accessToken: string
  /** Snapshot of the network. */
  snapshot: Snapshot

  /** ID of last network created. */
  private static availableNetworkId = 0

  //checks if the user is the local client
  isLocal = (userId) => {
    return this.userId === userId
  }

  //sends a chat message in the current channel
  async sendMessage(text: string) {
    const user = (Store.store.getState() as any).get('auth').get('user') as User
    await sendChatMessage({
      targetObjectId: user.instanceId,
      targetObjectType: 'instance',
      text: text
    })
  }

  //updates the client list with the right username for the user
  async updateUsername(userId, username) {
    for (let p in this.clients) {
      if (this.clients[p].userId === userId) {
        this.clients[p].name = username
        return
      }
    }
  }

  //returns the client for a player
  getPlayer = (player) => {
    for (var p in this.clients) {
      if (this.clients[p].name === player) {
        return this.clients[p]
      }
    }

    return undefined
  }
  //returns the entity for a player
  getPlayerEntity = (player): number => {
    for (let p in this.clients) {
      if (this.clients[p].name === player) {
        for (let e in this.networkObjects) {
          if (this.clients[p].userId === this.networkObjects[e].uniqueId) return this.networkObjects[e].entity
        }
      }
    }

    return undefined
  }

  //checks if a player has subscribed to a chat system
  hasSubscribedToChatSystem = (userId, system: string): boolean => {
    if (system === undefined || system === '' || userId === undefined) return false

    for (let p in this.clients) {
      if (this.clients[p].userId === userId) {
        return this.clients[p].subscribedChatUpdates.includes(system)
      }
    }

    return false
  }
  //subscribe a player to a chat system
  subscribeToChatSystem = (userId, system: string) => {
    if (system === undefined || system === '' || userId === undefined) return

    for (let p in this.clients) {
      if (this.clients[p].userId === userId) {
        if (system !== 'all' && !this.clients[p].subscribedChatUpdates.includes(system)) {
          this.clients[p].subscribedChatUpdates.push(system)
          return
        } else if (system === 'all') {
          this.clients[p].subscribedChatUpdates.push('emotions_system')
          //add all chat systems
          return
        }
      }
    }
  }
  //unsubscribe a player from a chat system
  unsubscribeFromChatSystem = (userId, system: string) => {
    if (system === undefined || system === '' || userId === undefined) return

    for (let p in this.clients) {
      if (this.clients[p].userId === userId) {
        if (system !== 'all' && this.clients[p].subscribedChatUpdates.includes(system)) {
          this.clients[p].subscribedChatUpdates.splice(this.clients[p].subscribedChatUpdates.indexOf(system), 1)
          return
        } else if (system === 'all') {
          this.clients[p].subscribedChatUpdates = []
          return
        }
      }
    }
  }
  //gets all the systems that a user has subscribed to
  getSubscribedChatSystems = (userId): string[] => {
    if (userId === undefined) return undefined

    for (let p in this.clients) {
      if (this.clients[p].userId === userId) {
        return this.clients[p].subscribedChatUpdates
      }
    }

    return undefined
  }

  //gets the chat system from a chat message
  getChatMessageSystem = (text: string): string => {
    if (text.startsWith('[emotions]')) return 'emotions_system'

    return 'none'
  }

  //removes the chat system command from a chat message
  removeMessageSystem = (text: string): string => {
    return text.substring(text.indexOf(']', 0) + 1)
  }

  /** Get next network id. */
  static getNetworkId(): number {
    return ++this.availableNetworkId
  }

  /** Schema of the network. */
  static _schemas: Map<string, Schema> = new Map()

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliable: RingBuffer<any> = new RingBuffer<any>(100)

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueReliable: RingBuffer<any> = new RingBuffer<any>(100)

  /** Buffer holding Mediasoup operations */
  mediasoupOperationQueue: RingBuffer<any> = new RingBuffer<any>(1000)

  /** State of the world. */
  worldState: WorldStateInterface = {
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    editObjects: [],
    destroyObjects: []
  }

  clientInputState: NetworkClientInputInterface = {
    networkId: -1,
    data: [],
    viewVector: {
      x: 0,
      y: 0,
      z: 0,
      w: 0
    },
    snapShotTime: 0,
    commands: [],
    transforms: []
  }

  /** Tick of the network. */
  tick: any = 0

  /** Disposes the network. */
  dispose(): void {
    // TODO: needs tests
    this.clients = {}
    if (this.transport && typeof this.transport.close === 'function') this.transport.close()
    this.transport = null
    Network.availableNetworkId = 0
    Network.instance = null
  }
}
