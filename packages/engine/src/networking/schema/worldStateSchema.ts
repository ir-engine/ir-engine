import { float32, Model, Schema, string, uint32, uint8 } from "superbuffer";
import { Network } from '../classes/Network';
import { WorldStateInterface } from "../interfaces/WorldState";

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
    snapShotTime: uint32,
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
  time: uint32
})

const createNetworkObjectSchema = new Schema({
    networkId: uint32,
    ownerId: string,
    prefabType: uint8,
    uniqueId: string,
    x: float32,
    y: float32,
    z: float32,
    qX: float32,
    qY: float32,
    qZ: float32,
    qW: float32
});

const editNetworkObjectSchema = new Schema({
    networkId: uint32,
    ownerId: string,
    component: string,
    state: string,
    currentId: uint32,
    value: uint32,
    whoIsItFor: string
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
    inputs: [inputKeyArraySchema],
    tick: uint32,
    timeFP: uint32,
    timeSP: uint32,
    transforms: [transformSchema]
});

// TODO: convert WorldStateInterface to PacketReadyWorldState in toBuffer and back in fromBuffer
/** Class for holding world state. */
export class WorldStateModel {
    /** Model holding client input. */
    static model: Model = new Model(worldStateSchema)

    /** Convert to buffer. */
    static toBuffer(worldState: WorldStateInterface, type: String): ArrayBuffer {
        // console.log("Making into buffer");
      //  'Reliable'
      if ( type === 'Reliable') {
        const state:any = {
          clientsConnected: worldState.clientsConnected,
          clientsDisconnected: worldState.clientsDisconnected,
          createObjects: worldState.createObjects,
          editObjects: worldState.editObjects,
          destroyObjects: worldState.destroyObjects,
          inputs: [],
          tick: 0,
          timeFP: 0,
          timeSP: 0,
          transforms: [],
          states: []
        };
        return Network.instance.packetCompression ? WorldStateModel.model.toBuffer(state) : state;
      } else
      if (type === 'UnReliable') {
        const timeToTwoUinit32 = Date.now().toString();
        const state:any = {
          clientsConnected: [],
          clientsDisconnected: [],
          createObjects: [],
          editObjects: [],
          destroyObjects: [],
          inputs: worldState.inputs?.map(input => {
            return {
              networkId: input.networkId,
              axes1d: Object.keys(input.axes1d).map(v => input.axes1d[v]),
              axes2d: Object.keys(input.axes2d).map(v => input.axes2d[v]),
              buttons: Object.keys(input.buttons).map(v => input.buttons[v]),
              viewVector: { ...input.viewVector },
              snapShotTime: 0,
            };
          }),
          tick: worldState.tick,
          timeFP: Number(timeToTwoUinit32.slice(0,6)), // first part
          timeSP: Number(timeToTwoUinit32.slice(6)), // second part
          transforms: worldState.transforms.map(v=> {
            return {
              ...v,
              snapShotTime: v.snapShotTime,
            }
          }),
          states: []
        };
        return Network.instance.packetCompression ? WorldStateModel.model.toBuffer(state) : state;
      }
    }

    /** Read from buffer. */
    static fromBuffer(buffer:any): WorldStateInterface {
      try{
        const state = Network.instance.packetCompression ?
        WorldStateModel.model.fromBuffer(buffer) as any : buffer as any;

        if (!state.transforms) {
          console.warn('Packet not from this, will ignored', state);
          return;
        }

        return {
          // @ts-ignore
          ...state,
          tick: Number(state.tick),
          time: state.timeFP*10000000+state.timeSP, // get uint64 from two uint32
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
      } catch(error){
        console.warn("Couldn't deserialize buffer", buffer, error)
      }

    }

}
