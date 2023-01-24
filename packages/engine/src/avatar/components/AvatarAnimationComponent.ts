import { useEffect } from 'react'
import { SkeletonHelper, Vector3 } from 'three'

import { getState, none, useHookstate } from '@xrengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
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
import { AvatarComponent } from './AvatarComponent'
import { AvatarPendingComponent } from './AvatarPendingComponent'

export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  onInit: (entity) => {
    return {
      /** Animaiton graph of this entity */
      animationGraph: {
        states: {},
        transitionRules: {},
        currentState: null!,
        stateChanged: null!
      },
      /** ratio between original and target skeleton's root.position.y */
      rootYRatio: 1,
      /** The input vector for 2D locomotion blending space */
      locomotion: new Vector3(),
      /** Animation frame (non physics) velocity */
      lastPosition: new Vector3(),
      /** Time since the last update */
      deltaAccumulator: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.animationGraph)) component.animationGraph.set(json.animationGraph)
    if (matches.number.test(json.rootYRatio)) component.rootYRatio.set(json.rootYRatio)
    if (matches.object.test(json.locomotion)) component.locomotion.value.copy(json.locomotion)
    if (matches.object.test(json.lastPosition)) component.lastPosition.value.copy(json.lastPosition)
    if (matches.number.test(json.deltaAccumulator)) component.deltaAccumulator.set(json.deltaAccumulator)
  }
})

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  onInit: (entity) => {
    return {
      /** Holds all the bones */
      rig: null! as BoneStructure,
      /** Read-only bones in bind pose */
      bindRig: null! as BoneStructure,
      helper: null as SkeletonHelper | null,
      /** The length of the torso in a t-pose, from the hip join to the head joint */
      torsoLength: 0,
      /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
      upperLegLength: 0,
      /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
      lowerLegLength: 0,
      /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
      footHeight: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.rig)) component.rig.set(json.rig as BoneStructure)
    if (matches.object.test(json.bindRig)) component.bindRig.set(json.bindRig as BoneStructure)
    if (matches.number.test(json.torsoLength)) component.torsoLength.set(json.torsoLength)
    if (matches.number.test(json.upperLegLength)) component.upperLegLength.set(json.upperLegLength)
    if (matches.number.test(json.lowerLegLength)) component.lowerLegLength.set(json.lowerLegLength)
    if (matches.number.test(json.footHeight)) component.footHeight.set(json.footHeight)
  },

  onRemove: (entity, component) => {
    if (component.helper.value) {
      removeObjectFromGroup(entity, component.helper.value)
    }
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, AvatarRigComponent)) throw root.stop()

    const debugEnabled = useHookstate(getState(EngineRendererState).debugEnable)
    const anim = useComponent(root.entity, AvatarRigComponent)
    const pending = useOptionalComponent(root.entity, AvatarPendingComponent)

    useEffect(() => {
      if (debugEnabled.value && !anim.helper.value && !pending?.value) {
        const helper = new SkeletonHelper(anim.value.rig.Hips.parent!)
        helper.frustumCulled = false
        helper.name = `skeleton-helper-${root.entity}`
        setObjectLayers(helper, ObjectLayers.PhysicsHelper)
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
