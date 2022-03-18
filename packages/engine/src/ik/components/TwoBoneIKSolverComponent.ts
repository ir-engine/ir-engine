import { Bone, Object3D, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * Solves Two-Bone IK.
 * target, hint and targetOffset params position/rotation properties are assumed to be in world space (e.g no parents)
 */
export type TwoBoneIKSolverComponentType = {
  root: Bone
  mid: Bone
  tip: Bone
  target: Object3D
  hint: Vector3 | null
  targetOffset: Object3D
  targetPosWeight: number
  targetRotWeight: number
  hintWeight: number
}

export const TwoBoneIKSolverComponent = createMappedComponent<TwoBoneIKSolverComponentType>('TwoBoneIKSolverComponent')
