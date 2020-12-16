import {Schema, Model, ExtractSchemaObject} from "../classes"; //"superbuffer"
import { int16, int32, uint8, uint32, uint64, int64, float32, boolean, string } from '../classes';
import { inputKeyArraySchema } from "./clientInputSchema";
import { NetworkInputInterface, PacketReadyWorldState, WorldStateInterface } from "../interfaces/WorldState";


const clientConnectedSchema = new Schema({
    userId: string
});

const clientDisconnectedSchema = new Schema({
    userId: string
});

const transformSchema = new Schema({
    networkId: uint32,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});

const snapshotSchema = new Schema({
  id: string,
  state: [transformSchema],
  time: uint64
})

const createNetworkObjectSchema = new Schema({
    networkId: uint32,
    ownerId: string,
    prefabType: uint8,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});

const destroyNetworkObjectSchema = new Schema({
    networkId: uint32
});

const worldStateSchema = new Schema({
    clientsConnected: [clientConnectedSchema],
    clientsDisconnected: [clientDisconnectedSchema],
    createObjects: [createNetworkObjectSchema],
    destroyObjects: [destroyNetworkObjectSchema],
    inputs: [inputKeyArraySchema],
    snapshot: snapshotSchema,
    tick: uint64,
    transforms: [transformSchema]
});

// TODO: convert WorldStateInterface to PacketReadyWorldState in toBuffer and back in fromBuffer
export class WorldStateModel {
    static model: Model = new Model(worldStateSchema)
    static toBuffer(objectOrArray: PacketReadyWorldState): ArrayBuffer {
        // @ts-ignore
        return this.model.toBuffer(objectOrArray);
    }
    static fromBuffer(buffer:unknown): PacketReadyWorldState {
        // @ts-ignore
        return this.model.fromBuffer(buffer);
    }
}