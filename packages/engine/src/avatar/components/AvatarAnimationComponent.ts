import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationGraph } from '../animation/AnimationGraph'
import { BoneStructure } from '../AvatarBoneMatching'

export type AvatarAnimationComponentType = {
  /** Animaiton graph of this entity */
  animationGraph: AnimationGraph

  /** ratio between original and target skeleton's root.position.y */
  rootYRatio: number

  /** The input vector for 2D locomotion blending space */
  locomotion: Vector3
}

export const AvatarAnimationComponent = createMappedComponent<AvatarAnimationComponentType>('AvatarAnimationComponent')

export type AvatarRigComponentType = {
  /** Holds all the bones */
  rig: BoneStructure

  /** Read-only bones in bind pose */
  bindRig: BoneStructure
}

export const AvatarRigComponent = createMappedComponent<AvatarRigComponentType>('AvatarRigComponent')
