import { string, float32, Model, Schema, uint32, uint8, uint64 } from '../../assets/superbuffer'
import { Pose } from '../../transform/TransformInterfaces'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const poseSchema = new Schema({
  networkId: uint32,
  pose: [float32]
})

const ikPoseSchema = new Schema({
  networkId: uint32,
  headPose: [float32],
  leftPose: [float32],
  rightPose: [float32]
})

const networkSchema = new Schema({
  tick: uint32,
  time: uint64,
  pose: [poseSchema],
  ikPose: [ikPoseSchema]
})

/** Interface for world state. */
export interface WorldStateInterface {
  /** Current world tick. */
  tick: number
  /** For interpolation. */
  time: number
  /** transform of world. */
  pose: {
    networkId: number
    pose: Pose
  }[]
  /** transform of ik avatars. */
  ikPose: {
    networkId: number
    headPose: Pose
    leftPose: Pose
    rightPose: Pose
  }[]
}

export class WorldStateModel {
  static model: Model = new Model(networkSchema)

  static toBuffer(worldState: WorldStateInterface): ArrayBuffer {
    worldState.time = Date.now()
    return WorldStateModel.model.toBuffer(worldState as any)
  }

  static fromBuffer(buffer: any): WorldStateInterface {
    try {
      const state = WorldStateModel.model.fromBuffer(buffer) as any
      return {
        ...state,
        time: Number(state.time) // cast from bigint to number
      }
    } catch (error) {
      console.warn("Couldn't deserialize buffer", buffer, error)
    }
  }
}
