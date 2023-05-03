import { VRM, VRMHumanBoneList, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AxesHelper, SkeletonHelper, SkinnedMesh, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import {
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { PoseSchema } from '../../transform/components/TransformComponent'
import { AnimationGraph } from '../animation/AnimationGraph'
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
      } as AnimationGraph,
      /** ratio between original and target skeleton's root.position.y */
      rootYRatio: 1,
      /** The input vector for 2D locomotion blending space */
      locomotion: new Vector3(),
      /** Time since the last update */
      deltaAccumulator: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.animationGraph)) component.animationGraph.set(json.animationGraph as AnimationGraph)
    if (matches.number.test(json.rootYRatio)) component.rootYRatio.set(json.rootYRatio)
    if (matches.object.test(json.locomotion)) component.locomotion.value.copy(json.locomotion)
    if (matches.number.test(json.deltaAccumulator)) component.deltaAccumulator.set(json.deltaAccumulator)
  }
})

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: {
    rig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, PoseSchema]))
  },

  onInit: (entity) => {
    return {
      /** Holds all the bones */
      rig: null! as VRMHumanBones,
      /** Read-only bones in bind pose */
      bindRig: null! as VRMHumanBones,
      helper: null as SkeletonHelper | null,
      /** The length of the torso in a t-pose, from the hip join to the head joint */
      torsoLength: 0,
      /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
      upperLegLength: 0,
      /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
      lowerLegLength: 0,
      /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
      footHeight: 0,
      /** Cache of the skinned meshes currently on the rig */
      skinnedMeshes: [] as SkinnedMesh[],
      /** The VRM model */
      vrm: null! as VRM
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.rig)) component.rig.set(json.rig as VRMHumanBones)
    if (matches.object.test(json.bindRig)) component.bindRig.set(json.bindRig as VRMHumanBones)
    if (matches.number.test(json.torsoLength)) component.torsoLength.set(json.torsoLength)
    if (matches.number.test(json.upperLegLength)) component.upperLegLength.set(json.upperLegLength)
    if (matches.number.test(json.lowerLegLength)) component.lowerLegLength.set(json.lowerLegLength)
    if (matches.number.test(json.footHeight)) component.footHeight.set(json.footHeight)
    if (matches.array.test(json.skinnedMeshes)) component.skinnedMeshes.set(json.skinnedMeshes as SkinnedMesh[])
    if (matches.object.test(json.vrm)) component.vrm.set(json.vrm as VRM)
  },

  onRemove: (entity, component) => {
    if (component.helper.value) {
      removeObjectFromGroup(entity, component.helper.value)
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).debugEnable)
    const anim = useComponent(entity, AvatarRigComponent)
    const pending = useOptionalComponent(entity, AvatarPendingComponent)

    useEffect(() => {
      if (debugEnabled.value && !anim.helper.value && !pending?.value) {
        const helper = new SkeletonHelper(anim.value.rig.hips.node.parent!)
        helper.frustumCulled = false
        helper.name = `skeleton-helper-${entity}`
        setObjectLayers(helper, ObjectLayers.PhysicsHelper)
        addObjectToGroup(entity, helper)
        anim.helper.set(helper)
      }

      if ((!debugEnabled.value || pending?.value) && anim.helper.value) {
        removeObjectFromGroup(entity, anim.helper.value)
        anim.helper.set(none)
      }
    }, [debugEnabled, pending])

    /**
     * Proxify the rig bones with the bitecs store
     */
    useEffect(() => {
      const rig = anim.rig.value
      for (const [boneName, bone] of Object.entries(rig)) {
        if (!bone) continue
        // const axesHelper = new AxesHelper(0.1)
        // setObjectLayers(axesHelper, ObjectLayers.Scene)
        // bone.add(axesHelper)
        proxifyVector3(AvatarRigComponent.rig[boneName].position, entity, bone.node.position)
        proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity, bone.node.quaternion)
      }
    }, [anim.rig])

    return null
  }
})
