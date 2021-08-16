import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import Pose from '../classes/Pose'
import { IKPose } from './IKPose'

type IKRigComponentType = {
  tpose: Pose // Base pose to calculate math from
  pose: Pose // Working pose to apply math to and copy back to bones
  chains: any // IK Chains
  points: any // Individual IK points (hands, head, feet)

  sourcePose: ReturnType<typeof IKPose.get>
  sourceRig: ReturnType<typeof IKRig.get>
}

export const IKRig = createMappedComponent<IKRigComponentType>()
