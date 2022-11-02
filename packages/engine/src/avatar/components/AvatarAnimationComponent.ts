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
}

export const AvatarAnimationComponent = createMappedComponent<AvatarAnimationComponentType>('AvatarAnimationComponent')

const EPSILON = 1e-6

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
    if (typeof json?.rig === 'object') {
      component.rig.set(json.rig)
      json.rig.Head?.scale.setScalar(EPSILON)
    }
    if (typeof json?.bindRig === 'object') component.bindRig.set(json.bindRig)
  },

  onRemove: (entity, component) => {
    component.value.rig?.Head?.scale.setScalar(1)
  }
})
