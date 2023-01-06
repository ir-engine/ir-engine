import { useEffect } from 'react'
import { SkeletonHelper, Vector3 } from 'three'

import { getState, none, useHookstate } from '@xrengine/hyperflux'

import {
  createMappedComponent,
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EngineRendererState } from '../../renderer/EngineRendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { AnimationGraph } from '../animation/AnimationGraph'
import { BoneStructure } from '../AvatarBoneMatching'
import { AvatarPendingComponent } from './AvatarPendingComponent'

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
      bindRig: null! as BoneStructure,
      helper: null as SkeletonHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.rig === 'object') component.rig.set(json.rig as BoneStructure)
    if (typeof json?.bindRig === 'object') component.bindRig.set(json.bindRig as BoneStructure)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, AvatarRigComponent)) throw root.stop()

    const debugEnabled = useHookstate(getState(EngineRendererState).debugEnable)
    const anim = useComponent(root.entity, AvatarRigComponent)
    const pending = useOptionalComponent(root.entity, AvatarPendingComponent)

    useEffect(() => {
      if (debugEnabled.value && !anim.helper.value && !pending?.value) {
        const helper = new SkeletonHelper(anim.value.rig.Hips)
        helper.name = `skeleton-helper-${root.entity}`
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(root.entity, helper)
        anim.helper.set(helper)
      }

      if ((!debugEnabled.value || pending?.value) && anim.helper.value) {
        removeObjectFromGroup(root.entity, anim.helper.value)
        anim.helper.set(none)
      }
    }, [debugEnabled, pending])

    return null
  }
})
