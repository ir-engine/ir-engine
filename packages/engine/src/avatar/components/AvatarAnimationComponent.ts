import { Vector3 } from 'three'

import { createMappedComponent, defineComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationGraph } from '../animation/AnimationGraph'
import { BoneStructure } from '../AvatarBoneMatching'

export type AvatarAnimationComponentType = {
  /** Animaiton graph of this entity */
  animationGraph: AnimationGraph

  /** ratio between original and target skeleton's root.position.y */
  rootYRatio: number

  /** The input vector for 2D locomotion blending space */
  locomotion: Vector3

  /** Time since the last update */
  deltaAccumulator: number
}

export const AvatarAnimationComponent = createMappedComponent<AvatarAnimationComponentType>('AvatarAnimationComponent')

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  onInit: (entity) => {
    return {
      /** Holds all the bones */
      rig: null! as BoneStructure,
      /** Read-only bones in bind pose */
      bindRig: null! as BoneStructure
    }
  },

  onSet: (
    entity,
    component,
    json: {
      rig: BoneStructure
      bindRig: BoneStructure
    }
  ) => {
    if (typeof json?.rig === 'object') component.rig.set(json.rig)
    if (typeof json?.bindRig === 'object') component.bindRig.set(json.bindRig)
  }
})
