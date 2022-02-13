import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import Pose from '../classes/Pose'
import { Chain } from '../classes/Chain'
import { Object3D } from 'three'
import { BoneStructure } from '../../avatar/AvatarBoneMatching'

export type PointData = { index: number }

export type IKRigComponentType = {
  boneStructure: BoneStructure
  rootParent: Object3D
  tpose: Pose // Starting pose to calculate values from
  pose: Pose // Working pose to apply math to and copy back to bones
  chains: Record<string, Chain> // IK Chains
  points: Record<string, PointData> // Individual IK points (hands, head, feet)
}

export const IKRigComponent = createMappedComponent<IKRigComponentType>('IKRigComponent')
export const IKRigTargetComponent = createMappedComponent<IKRigComponentType>('IKRigTargetComponent')
