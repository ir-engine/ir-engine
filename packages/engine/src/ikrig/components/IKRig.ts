import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import Pose from '../classes/Pose'
import { Chain } from './Chain'
import { IKPose } from './IKPose'

export type IKRigComponentType = {
  tpose?: Pose // Base pose to calculate math from
  pose?: Pose // Working pose to apply math to and copy back to bones
  chains?: Record<string, Chain> // IK Chains
  points?: Record<string, { index: number }> // Individual IK points (hands, head, feet)

  sourcePose?: ReturnType<typeof IKPose.get>
  sourceRig?: ReturnType<typeof IKRig.get>
}

export const IKRig = createMappedComponent<IKRigComponentType>()
