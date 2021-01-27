import { float32, Model, Schema, string, uint32, uint64, uint8 } from "superbuffer";
import { PacketWorldState, WorldStateInterface } from "../interfaces/WorldState";
//import { inputKeyArraySchema } from "./clientInputSchema";

const inputKeySchema = new Schema({
  input: uint8,
  value: uint8, // float32
  lifecycleState: uint8
});

const inputAxis1DSchema = new Schema({
  input: uint8,
  value: float32,
  lifecycleState: uint8
});

const inputAxis2DSchema = new Schema({
  input: uint8,
  value: [float32],
  lifecycleState: uint8
});

const viewVectorSchema = new Schema({
  x: float32,
  y: float32,
  z: float32
});

/** Schema for input. */
export const inputKeyArraySchema = new Schema({
  networkId: uint32,
  axes1d: [inputAxis1DSchema],
  axes2d: [inputAxis2DSchema],
  buttons: [inputKeySchema],
  viewVector: viewVectorSchema
});

const clientConnectedSchema = new Schema({
    userId: string,
    name: string
});

const clientDisconnectedSchema = new Schema({
    userId: string
});

const transformSchema = new Schema({
    networkId: uint32,
    snapShotTime: uint64,
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
    tick: uint64,
    transforms: [transformSchema]
});

// TODO: convert WorldStateInterface to PacketReadyWorldState in toBuffer and back in fromBuffer
/** Class for holding world state. */
export class WorldStateModel {
    /** Model holding client input. */
    static model: Model = new Model(worldStateSchema)

    /** Convert to buffer. */
    static toBuffer(worldState: WorldStateInterface): ArrayBuffer {
        // console.log("Making into buffer");
        // console.log(objectOrArray);

        const state:PacketWorldState = {
          clientsConnected: worldState.clientsConnected,
          clientsDisconnected: worldState.clientsDisconnected,
          createObjects: worldState.createObjects,
          destroyObjects: worldState.destroyObjects,
          inputs: worldState.inputs?.map(input => {
            return {
              networkId: input.networkId,
              axes1d: Object.keys(input.axes1d).map(v => input.axes1d[v]),
              axes2d: Object.keys(input.axes2d).map(v => input.axes2d[v]),
              buttons: Object.keys(input.buttons).map(v => input.buttons[v]),
              viewVector: { ...input.viewVector },
              snapShotTime: BigInt(0)
            };
          }),
          tick: BigInt( worldState.tick ),
          transforms: worldState.transforms.map(v=> {
            return {
              ...v,
              snapShotTime: BigInt(v.snapShotTime)
            }
          }),
          states: []
        };

        // @ts-ignore
        return this.model.toBuffer(state);
    }

    /** Read from buffer. */
    static fromBuffer(buffer:unknown): WorldStateInterface {
        // @ts-ignore
        const state = this.model.fromBuffer(buffer) as PacketWorldState;
        return {
          ...state,
          tick: Number(state.tick),
          transforms: state.transforms.map(v=> {
            const { snapShotTime, ...otherValues } = v;
            return {
              ...otherValues,
              snapShotTime: Number(snapShotTime)
            }
          }),
          // inputs: state.inputs.map(v=> {
          //   return {
          //     ...v
          //   }
          // })
        };
    }
}
