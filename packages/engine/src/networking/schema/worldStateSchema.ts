import { float32, string8, uint16, uint64, uint8, uint32 } from "../../common/types/DataTypes";
import { Model } from "../classes/Model";
import { createSchema } from "../functions/createSchema";
import { inputKeyArraySchema } from "./clientInputSchema";

const clientConnectedSchema = createSchema('clientConnected', {
    clientId: { type: string8, length: 20 },
    userId: { type: string8, length: 36 }
});

const clientDisconnectedSchema = createSchema('clientDisconnected', {
    clientId: { type: string8, length: 20 },
    userId: { type: string8, length: 36 }
});

const createNetworkObjectSchema = createSchema('createNetworkObject', {
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

const destroyNetworkObjectSchema = createSchema('destroyNetworkObject', {
    networkId: uint32
});

const transformSchema = createSchema('transform', {
    networkId: uint32,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
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
