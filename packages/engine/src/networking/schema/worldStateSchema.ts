import { float32, string8, uint16, uint64, uint8 } from "../../common/types/DataTypes";
import { Model } from "../classes/Model";
import { createSchema } from "../functions/createSchema";
import { inputKeyArraySchema } from "./clientInputSchema";

const rotationSchema = createSchema('rotation', {
    x: float32,
    y: float32,
    z: float32,
    w: float32
});

const clientConnectedSchema = createSchema('clientConnected', {
    clientId: uint8,
    userId: { type: string8, length: 16 }
})

const clientDisconnectedSchema = createSchema('clientDisconnected', {
    clientId: uint8,
    userId: { type: string8, length: 16 }
})

const createNetworkObjectSchema = createSchema('createNetworkObject', {
    networkId: uint16,
    ownerId: { type: string8, length: 16 },
    prefabType: uint8,
    x: float32,
    y: float32,
    z: float32,
    q: rotationSchema
})

const destroyNetworkObjectSchema = createSchema('destroyNetworkObject', {
    networkId: uint16
})

const transformSchema = createSchema('transform', {
    networkId: uint16,
    x: float32,
    y: float32,
    z: float32,
    q: rotationSchema
});

const worldStateSchema = createSchema('worldState', {
    tick: uint64,
    transforms: [transformSchema],
    inputs: [inputKeyArraySchema],
    clientsConnected: [clientConnectedSchema],
    clientsDisconnected: [clientDisconnectedSchema],
    createObjects: [createNetworkObjectSchema],
    destroyObjects: [destroyNetworkObjectSchema]
});

export const worldStateModel = new Model(worldStateSchema);
