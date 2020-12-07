import { BufferSchema, Model } from '@geckos.io/typed-array-buffer-schema'
import { string8, uint64, uint8, uint32, float32 } from '@geckos.io/typed-array-buffer-schema'
//import { float32, string8, uint16, uint64, uint8, uint32 } from "../../common/types/DataTypes";
//import { Model } from "../classes/Model";
//import { createSchema } from "../functions/createSchema";
import { inputKeyArraySchema } from "./clientInputSchema";


const clientConnectedSchema = BufferSchema.schema('clientConnected', {
    userId: { type: string8, length: 36 }
});

const clientDisconnectedSchema = BufferSchema.schema('clientDisconnected', {
    userId: { type: string8, length: 36 }
});

const transformSchema = BufferSchema.schema('transform', {
    networkId: uint32,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});

const snapshotSchema = BufferSchema.schema('snapshot', {
  id: { type: string8, length: 6 },
  time: uint64
})

const createNetworkObjectSchema = BufferSchema.schema('createNetworkObject', {
    networkId: uint32,
    ownerId: { type: string8, length: 36 },
    prefabType: uint8,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});

const bbbSchema = BufferSchema.schema('bbb', {
  bbb: uint8
});

const kkkSchema = BufferSchema.schema('kkk', {
  m: uint32,
  aaa: [bbbSchema],
});

const destroyNetworkObjectSchema = BufferSchema.schema('destroyNetworkObject', {
    networkId: uint32
});

const worldStateSchema = BufferSchema.schema('worldState', {
    clientsConnected: [clientConnectedSchema],
    clientsDisconnected: [clientDisconnectedSchema],
    createObjects: [createNetworkObjectSchema],
    destroyObjects: [destroyNetworkObjectSchema],
    inputs: [inputKeyArraySchema],
    kkk:[kkkSchema],
    snapshot: [snapshotSchema],
    states: [bbbSchema],
    tick: uint64,
    transforms: [transformSchema]
});

export const worldStateModel = new Model(worldStateSchema);
