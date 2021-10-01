import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { string, float32, Schema, uint32, uint8, uint64, int8 } from '../../assets/superbuffer'
import { Model } from '../../assets/superbuffer/model'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const poseSchema = new Schema({
  networkId: uint32,
  position: [float32],
  rotation: [float32],
  linearVelocity: [float32],
  angularVelocity: [float32]
})

const ikPoseSchema = new Schema({
  networkId: uint32,
  headPosePosition: [float32],
  headPoseRotation: [float32],
  leftPosePosition: [float32],
  leftPoseRotation: [float32],
  rightPosePosition: [float32],
  rightPoseRotation: [float32]
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
    networkId: NetworkId
    position: number[]
    rotation: number[]
    linearVelocity: number[]
    angularVelocity: number[]
  }[]
  /** transform of ik avatars. */
  ikPose: {
    networkId: NetworkId
    headPosePosition: number[]
    headPoseRotation: number[]
    leftPosePosition: number[]
    leftPoseRotation: number[]
    rightPosePosition: number[]
    rightPoseRotation: number[]
  }[]
}

export class WorldStateModel {
  static model: Model = new Model(networkSchema)

  static toBuffer(worldState: WorldStateInterface): ArrayBuffer {
    worldState.time = Date.now()
    return WorldStateModel.model.toBuffer(worldState as any)
  }

  static fromBuffer(buffer: any): WorldStateInterface {
    const state = WorldStateModel.model.fromBuffer(buffer) as any
    return {
      ...state,
      time: Number(state.time) // cast from bigint to number
    }
  }
}
