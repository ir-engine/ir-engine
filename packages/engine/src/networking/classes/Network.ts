import { Schema } from "../../assets/superbuffer";
import { RingBuffer } from '../../common/classes/RingBuffer';
import { Entity } from '../../ecs/classes/Entity';
import { NetworkObjectList } from '../interfaces/NetworkObjectList';
import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkTransport } from '../interfaces/NetworkTransport';
import { NetworkClientInputInterface, WorldStateInterface } from "../interfaces/WorldState";
import { Snapshot } from "../types/SnapshotDataTypes";
import SocketIO from "socket.io";
import { GameStateActionMessage, GameStateUpdateMessage, ClientGameActionMessage } from '../../game/types/GameMessage';


export interface NetworkClientList {
  // Key is socket ID
  [key: string]: {
    userId?: string;
    name?: string;
    socket?: SocketIO.Socket;
    socketId?: string;
    lastSeenTs?: any;
    joinTs?: any;
    media?: {};
    consumerLayers?: {};
    stats?: {};
    instanceSendTransport?: any;
    instanceRecvTransport?: any;
    channelSendTransport?: any;
    channelRecvTransport?: any;
    dataConsumers?: Map<string, any>; // Key => id of data producer
    dataProducers?: Map<string, any>; // Key => label of data channel}
    avatarDetail?: any;
  };
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
  /** Newly connected clients over this network in this frame. */
  clientsConnected = []
  /** Disconnected client in this frame. */
  clientsDisconnected = []
  /** List of data producer nodes. */
  dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  dataConsumers = new Map<string, any>()

  /** Current game state */
  gameState: GameStateUpdateMessage[] = []
  clientGameAction: ClientGameActionMessage[] = []

  /** Game mode mapping schema */
  loadedGames: Entity[] = []; // its for network

  /** Game actions that happened this frame */
  gameStateActions: GameStateActionMessage[] = []

  /** Newly created Network Objects in this frame. */
  createObjects = []
  /** Destroyed Network Objects in this frame. */
  editObjects = []
  /** Destroyed Network Objects in this frame. */
  destroyObjects = []
  /** Map of Network Objects. */
  networkObjects: NetworkObjectList = {}
  localClientEntity: Entity = null
  /** Socket id of the network instance connection. */
  instanceSocketId: string
  /** Socket id of the network channel connection. */
  channelSocketId: string
  /** User id hosting this network. */
  userId: string
  /** Network id of the local User. */
  localAvatarNetworkId: number
  /** Access tocken of the User. */
  accessToken: string
  /** Snapshot of the network. */
  snapshot: Snapshot

  /** ID of last network created. */
  private static availableNetworkId = 0

  /** Get next network id. */
  static getNetworkId(): number {
    return ++this.availableNetworkId;
  }

  /** Schema of the network. */
  static _schemas: Map<string, Schema> = new Map()

  /** Buffer holding all incoming Messages. */
  incomingMessageQueue: RingBuffer<any> = new RingBuffer<any>(100)

  /** State of the world. */
  worldState: WorldStateInterface = {
    tick: 0,
    transforms: [],
    ikTransforms: [],
    time: 0,
    inputs: [],
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    editObjects: [],
    destroyObjects: [],
    gameState: [],
    gameStateActions: []
  };

  clientInputState: NetworkClientInputInterface = {
    networkId: -1,
    buttons: [],
    axes1d: [],
    axes2d: [],
    axes6DOF: [],
    viewVector: {
      x: 0, y: 0, z: 0
    },
    snapShotTime: 0,
    // switchInputs: sendSwitchInputs ? this.switchId : 0,
    characterState: 0,
    clientGameAction: []
  }
  
  /** Tick of the network. */
  tick: any = 0

  /** Disposes the network. */
  dispose(): void {
    // TODO: needs tests
    this.clients = {};
    this.transport = null;
    Network.availableNetworkId = 0;
    Network.instance = null;
  }
}
