import { float32, int32, Model, Schema, string, uint32, uint8 } from '../../assets/superbuffer'
import { Network } from '../classes/Network'
import { TransformStateInterface } from '../interfaces/WorldState'

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
})

const ikTransformSchema = new Schema({
  networkId: uint32,
  snapShotTime: uint32,
  hmd: [float32],
  left: [float32],
  right: [float32]
})

const transformStateSchema = new Schema({
  tick: uint32,
  timeFP: uint32,
  timeSP: uint32,
  transforms: [transformSchema],
  ikTransforms: [ikTransformSchema]
})

// TODO: convert WorldStateInterface to PacketReadyWorldState in toBuffer and back in fromBuffer
/** Class for holding world state. */
export class TransformStateModel {
  /** Model holding client input. */
  static model: Model = new Model(transformStateSchema)

  /** Convert to buffer. */
  static toBuffer(worldState: TransformStateInterface): ArrayBuffer {
    const timeToTwoUinit32 = Date.now().toString()
    const state: any = {
      tick: worldState.tick,
      timeFP: Number(timeToTwoUinit32.slice(0, 6)), // first part
      timeSP: Number(timeToTwoUinit32.slice(6)), // second part
      transforms: worldState.transforms.map((v) => {
        return {
          ...v,
          snapShotTime: v.snapShotTime
        }
      }),
      ikTransforms: worldState.ikTransforms.map((v) => {
        return {
          ...v,
          snapShotTime: v.snapShotTime
        }
      })
    }
    return Network.instance.packetCompression ? TransformStateModel.model.toBuffer(state) : state
  }

  /** Read from buffer. */
  static fromBuffer(buffer: any): TransformStateInterface {
    try {
      const state = Network.instance.packetCompression ? TransformStateModel.model.fromBuffer(buffer) : buffer

      if (!state.transforms) {
        console.warn('Packet not from this, will ignored', state)
        return
      }

      return {
        ...state,
        tick: Number(state.tick),
        time: state.timeFP * 10000000 + state.timeSP, // get uint64 from two uint32
        transforms: state.transforms.map((v) => {
          const { snapShotTime, ...otherValues } = v
          return {
            ...otherValues,
            snapShotTime: Number(snapShotTime)
          }
        })
      }
    } catch (error) {
      console.warn("Couldn't deserialize buffer", buffer, error)
    }
  }
}
