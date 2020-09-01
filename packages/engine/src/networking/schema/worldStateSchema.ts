import { createSchema } from "../functions/createSchema";
import { uint16, uint8, int16, int64 } from "../../common/types/DataTypes";
import { Model } from "../classes/Model";
const stateSchema = createSchema('state', {
    networkId: uint16,
    state: uint8
});
const rotationSchema = createSchema('rotation', {
    x: int16,
    y: int16,
    z: int16,
    w: int16
});
const positionSchema = createSchema('position', {
    x: int16,
    y: int16,
    z: int16
});
const transformSchema = createSchema('transform', {
    networkId: uint16,
    position: positionSchema,
    rotation: rotationSchema
});
const worldStateSchema = createSchema('worldState', {
    time: int64,
    tick: uint16,
    transforms: [transformSchema],
    states: [stateSchema]
});

export const worldStateModel = new Model(worldStateSchema);
