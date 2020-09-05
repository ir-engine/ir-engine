import { createSchema } from "../functions/createSchema";
import { uint16, uint8, int16, int64, float32, string8 } from "../../common/types/DataTypes";
import { Model } from "../classes/Model";
import { inputKeyArraySchema } from "./clientInputSchema";

const rotationSchema = createSchema('rotation', {
    x: float32,
    y: float32,
    z: float32,
    w: float32
});

const clientConnectedSchema = createSchema('clientConnected', {
    clientId: uint8,
    userId: string8
})

const clientDisconnectedSchema = createSchema('clientDisconnected', {
    clientId: uint8,
    userId: string8
})

const createNetworkObjectSchema = createSchema('createNetworkObject', {
    networkId: uint16,
    ownerId: string8,
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
    tick: uint16,
    transforms: [transformSchema],
    inputs: [inputKeyArraySchema],
    clientsConnected: [clientConnectedSchema],
    clientsDisconnected: [clientDisconnectedSchema],
    createObjects: [createNetworkObjectSchema],
    destroyObjects: [destroyNetworkObjectSchema]
});

export const worldStateModel = new Model(worldStateSchema);
