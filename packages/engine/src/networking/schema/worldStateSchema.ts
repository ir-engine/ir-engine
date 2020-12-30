import { float32, Model, Schema, string, uint32, uint64, uint8 } from "superbuffer";
import { PacketReadyWorldState } from "../interfaces/WorldState";
import { inputKeyArraySchema } from "./clientInputSchema";


const clientConnectedSchema = new Schema({
    userId: string,
    name: string
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