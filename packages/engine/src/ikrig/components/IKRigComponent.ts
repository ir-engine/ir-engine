import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import Pose from '../classes/Pose'
import { Chain } from '../classes/Chain'
import { IKPoseComponent } from './IKPoseComponent'

export type PointData = { index: number }

export type IKRigComponentType = {
  tpose?: Pose // Base pose to calculate math from
  pose?: Pose // Working pose to apply math to and copy back to bones
  chains?: Record<string, Chain> // IK Chains
  points?: Record<string, PointData> // Individual IK points (hands, head, feet)

  // sourcePose?: ReturnType<typeof IKPoseComponent.get>
  // sourceRig?: ReturnType<typeof IKRig.get>
}

export const IKRigComponent = createMappedComponent<IKRigComponentType>('IKRigComponent')
export const IKRigTargetComponent = createMappedComponent<IKRigComponentType>('IKRigTargetComponent')
