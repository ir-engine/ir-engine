import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Schema, float32, string, uint32, uint64 } from '../../assets/superbuffer'
import { Model } from '../../assets/superbuffer/model'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const poseSchema = new Schema({
  ownerId: string,
  networkId: uint32,
  position: [float32],
  rotation: [float32],
  linearVelocity: [float32],
  angularVelocity: [float32]
})

const jointTransformSchema = new Schema({
  key: string,
  position: [float32],
  rotation: [float32]
})

const handPoseSchema = new Schema({
  joints: [jointTransformSchema]
})

const handsPoseSchema = new Schema({
  ownerId: string,
  networkId: uint32,
  hands: [handPoseSchema]
})

const controllerPoseSchema = new Schema({
  ownerId: string,
  networkId: uint32,
  headPosePosition: [float32],
  headPoseRotation: [float32],
  leftRayPosition: [float32],
  leftRayRotation: [float32],
  rightRayPosition: [float32],
  rightRayRotation: [float32],
  leftGripPosition: [float32],
  leftGripRotation: [float32],
  rightGripPosition: [float32],
  rightGripRotation: [float32]
})

const networkSchema = new Schema({
  tick: uint32,
  time: uint64,
  pose: [poseSchema],
  controllerPose: [controllerPoseSchema],
  handsPose: [handsPoseSchema]
})

/** Interface for world state. */
export interface WorldStateInterface {
  /** Current world tick. */
  tick: number
  /** For interpolation. */
  time: number
  /** transform of world. */
  pose: {
    ownerId: UserId
    networkId: NetworkId
    position: number[]
    rotation: number[]
    linearVelocity: number[]
    angularVelocity: number[]
  }[]
  /** transform of ik avatars. */
  controllerPose: {
    ownerId: UserId
    networkId: NetworkId
    headPosePosition: number[]
    headPoseRotation: number[]
    leftRayPosition: number[]
    leftRayRotation: number[]
    rightRayPosition: number[]
    rightRayRotation: number[]
    leftGripPosition: number[]
    leftGripRotation: number[]
    rightGripPosition: number[]
    rightGripRotation: number[]
  }[]
  handsPose: {
    ownerId: UserId
    networkId: NetworkId
    hands: {
      joints: [
        {
          key: string
          position: number[]
          rotation: number[]
        }
      ]
    }[]
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
