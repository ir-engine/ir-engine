import { createSchema } from "../functions/createSchema";
import { uint16, uint8, int16, int64, float32 } from "../../common/types/DataTypes";
import { Model } from "../classes/Model";
const stateSchema = createSchema('state', {
    networkId: uint16,
    state: uint8
});
const rotationSchema = createSchema('rotation', {
    x: float32,
    y: float32,
    z: float32,
    w: float32
});

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
    states: [stateSchema]
});

export const worldStateModel = new Model(worldStateSchema);
