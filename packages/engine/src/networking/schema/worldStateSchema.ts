import { float32, Model, Schema, string, uint32, uint8 } from "../../assets/superbuffer";
import { Network } from '../classes/Network';
import { convertBufferSupportedStringToObj, convertObjToBufferSupportedString } from "../functions/jsonSerialize";
import { WorldStateInterface } from "../interfaces/WorldState";

const storageSchema = new Schema({
  component: string,
  variables: string
});

const stateSchema = new Schema({
  uuid: string,
  role: string,
  components: [string],
  storage: [storageSchema]
});

const gameStateUpdateSchema = new Schema({
  game: string,
  ownerId: string,
  state: [stateSchema]
});

const gameStateActionSchema = new Schema({
  game: string,
  role: string,
  component: string,
  uuid: string,
  componentArgs: string
})

/** Schema for input. */
const clientConnectedSchema = new Schema({
  userId: string,
  avatarDetail: {
    avatarId: string,
    avatarURL: string,
    thumbnailURL: string,
  },
});

const clientDisconnectedSchema = new Schema({
  userId: string
});

const createNetworkObjectSchema = new Schema({
  networkId: uint32,
  ownerId: string,
  prefabType: uint8,
  uniqueId: string,
  parameters: string,
});

const editNetworkObjectSchema = new Schema({
  networkId: uint32,
  ownerId: string,
  type: uint8,
  values: [float32],
  data: [string],
});

const destroyNetworkObjectSchema = new Schema({
  networkId: uint32
});

const worldStateSchema = new Schema({
  clientsConnected: [clientConnectedSchema],
  clientsDisconnected: [clientDisconnectedSchema],
  createObjects: [createNetworkObjectSchema],
  editObjects: [editNetworkObjectSchema],
  destroyObjects: [destroyNetworkObjectSchema],
  gameState: [gameStateUpdateSchema],
  gameStateActions: [gameStateActionSchema]
});

// TODO: convert WorldStateInterface to PacketReadyWorldState in toBuffer and back in fromBuffer
/** Class for holding world state. */
export class WorldStateModel {
  /** Model holding client input. */
  static model: Model = new Model(worldStateSchema)

  /** Convert to buffer. */
  static toBuffer(worldState: WorldStateInterface): ArrayBuffer {
    worldState.createObjects.forEach((createObject) => {
      createObject.parameters = createObject.parameters ? convertObjToBufferSupportedString(createObject.parameters) : ''
    });
    const state: any = {
      clientsConnected: worldState.clientsConnected,
      clientsDisconnected: worldState.clientsDisconnected,
      createObjects: worldState.createObjects,
      editObjects: worldState.editObjects,
      destroyObjects: worldState.destroyObjects,
      gameState: worldState.gameState,
      gameStateActions: worldState.gameStateActions
    };
    return Network.instance.packetCompression ? WorldStateModel.model.toBuffer(state) : state;
  }

  /** Read from buffer. */
  static fromBuffer(buffer: any): WorldStateInterface {
    try {
      const state: WorldStateInterface = Network.instance.packetCompression ? WorldStateModel.model.fromBuffer(buffer) : buffer;
      state.createObjects.forEach((createObject) => {
        if(createObject.parameters !== '') createObject.parameters = convertBufferSupportedStringToObj(createObject.parameters)
      });
      return state;
    } catch (error) {
      console.warn("Couldn't deserialize buffer", buffer, error)
    }
  }
}
