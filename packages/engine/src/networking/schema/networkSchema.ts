import { string, float32, Model, Schema, uint32, uint8, uint64 } from '../../assets/superbuffer'
import { Pose } from '../../transform/TransformInterfaces'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const poseSchema = new Schema({
  networkId: uint32,
  snapShotTime: uint32,
  pose: [float32]
})

const ikPoseSchema = new Schema({
  networkId: uint32,
  snapShotTime: uint32,
  headPose: [float32],
  leftPose: [float32],
  rightPose: [float32]
})

const networkSchema = new Schema({
  tick: uint32,
  time: uint64,
  transforms: [poseSchema],
  ikTransforms: [ikPoseSchema]
})

/** Interface for world state. */
export interface WorldStateInterface {
  /** Current world tick. */
  tick: number
  /** For interpolation. */
  time: number
  /** transform of world. */
  transforms: {
    networkId: number
    snapShotTime: number
    pose: Pose
  }[]
  /** transform of ik avatars. */
  ikTransforms: {
    networkId: number
    snapShotTime: number
    headPose: Pose
    leftPose: Pose
    rightPose: Pose
  }[]
}

export class WorldStateModel {
  static model: Model = new Model(networkSchema)

  static toBuffer(worldState: WorldStateInterface): ArrayBuffer {
    const time = Date.now()
    const state: any = {
      tick: worldState.tick,
      time,
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
    return WorldStateModel.model.toBuffer(state)
  }

  static fromBuffer(buffer: any): WorldStateInterface {
    try {
      const state = WorldStateModel.model.fromBuffer(buffer) as any

      if (!state.transforms) {
        console.warn('Packet not from this, will ignored', state)
        return
      }

      return {
        ...state,
        time: Number(state.time), // cast from bigint to number
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
