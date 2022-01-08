import { Object3D } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Chain } from '../classes/Chain'
import Pose from '../classes/Pose'

export type PointData = { index: number }

export type IKRigComponentType = {
  rootParent: Object3D
  tpose: Pose // Starting pose to calculate values from
  pose: Pose // Working pose to apply math to and copy back to bones
  chains: Record<string, Chain> // IK Chains
  points: Record<string, PointData> // Individual IK points (hands, head, feet)
}

export const IKRigComponent = createMappedComponent<IKRigComponentType>('IKRigComponent')
export const IKRigTargetComponent = createMappedComponent<IKRigComponentType>('IKRigTargetComponent')
