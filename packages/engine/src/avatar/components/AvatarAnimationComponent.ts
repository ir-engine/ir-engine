import { useEffect } from 'react'
import { AxesHelper, SkeletonHelper, SkinnedMesh, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import {
  createMappedComponent,
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { PoseSchema } from '../../transform/components/TransformComponent'
import { AnimationGraph } from '../animation/AnimationGraph'
import { BoneStructure } from '../AvatarBoneMatching'
import { AvatarComponent } from './AvatarComponent'
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

const RigSchema = {
  Root: PoseSchema,
  Hips: PoseSchema,
  Spine: PoseSchema,
  Spine1: PoseSchema,
  Spine2: PoseSchema,
  Neck: PoseSchema,
  Head: PoseSchema,
  LeftEye: PoseSchema,
  RightEye: PoseSchema,
  LeftShoulder: PoseSchema,
  LeftArm: PoseSchema,
  LeftForeArm: PoseSchema,
  // LeftForeArmTwist: PoseSchema,
  LeftHand: PoseSchema,
  LeftUpLeg: PoseSchema,
  LeftLeg: PoseSchema,
  LeftFoot: PoseSchema,
  RightShoulder: PoseSchema,
  RightArm: PoseSchema,
  RightForeArm: PoseSchema,
  // RightForeArmTwist: PoseSchema,
  RightHand: PoseSchema,
  RightUpLeg: PoseSchema,
  RightLeg: PoseSchema,
  RightFoot: PoseSchema,
  LeftHandPinky1: PoseSchema,
  LeftHandPinky2: PoseSchema,
  LeftHandPinky3: PoseSchema,
  LeftHandPinky4: PoseSchema,
  LeftHandPinky5: PoseSchema,
  LeftHandRing1: PoseSchema,
  LeftHandRing2: PoseSchema,
  LeftHandRing3: PoseSchema,
  LeftHandRing4: PoseSchema,
  LeftHandRing5: PoseSchema,
  LeftHandMiddle1: PoseSchema,
  LeftHandMiddle2: PoseSchema,
  LeftHandMiddle3: PoseSchema,
  LeftHandMiddle4: PoseSchema,
  LeftHandMiddle5: PoseSchema,
  LeftHandIndex1: PoseSchema,
  LeftHandIndex2: PoseSchema,
  LeftHandIndex3: PoseSchema,
  LeftHandIndex4: PoseSchema,
  LeftHandIndex5: PoseSchema,
  LeftHandThumb1: PoseSchema,
  LeftHandThumb2: PoseSchema,
  LeftHandThumb3: PoseSchema,
  LeftHandThumb4: PoseSchema,
  RightHandPinky1: PoseSchema,
  RightHandPinky2: PoseSchema,
  RightHandPinky3: PoseSchema,
  RightHandPinky4: PoseSchema,
  RightHandPinky5: PoseSchema,
  RightHandRing1: PoseSchema,
  RightHandRing2: PoseSchema,
  RightHandRing3: PoseSchema,
  RightHandRing4: PoseSchema,
  RightHandRing5: PoseSchema,
  RightHandMiddle1: PoseSchema,
  RightHandMiddle2: PoseSchema,
  RightHandMiddle3: PoseSchema,
  RightHandMiddle4: PoseSchema,
  RightHandMiddle5: PoseSchema,
  RightHandIndex1: PoseSchema,
  RightHandIndex2: PoseSchema,
  RightHandIndex3: PoseSchema,
  RightHandIndex4: PoseSchema,
  RightHandIndex5: PoseSchema,
  RightHandThumb1: PoseSchema,
  RightHandThumb2: PoseSchema,
  RightHandThumb3: PoseSchema,
  RightHandThumb4: PoseSchema
}

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: { rig: RigSchema },

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
      footHeight: 0,
      /** Cache of the skinned meshes currently on the rig */
      skinnedMeshes: [] as SkinnedMesh[]
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
    if (matches.array.test(json.skinnedMeshes)) component.skinnedMeshes.set(json.skinnedMeshes as SkinnedMesh[])
  },

  onRemove: (entity, component) => {
    if (component.helper.value) {
      removeObjectFromGroup(entity, component.helper.value)
    }
  },

  reactor: function ({ root }) {
    const entity = root.entity

    if (!hasComponent(entity, AvatarRigComponent)) throw root.stop()

    const debugEnabled = useHookstate(getMutableState(RendererState).debugEnable)
    const anim = useComponent(root.entity, AvatarRigComponent)
    const pending = useOptionalComponent(root.entity, AvatarPendingComponent)

    useEffect(() => {
      if (debugEnabled.value && !anim.helper.value && !pending?.value) {
        const helper = new SkeletonHelper(anim.value.rig.Hips.parent!)
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
        proxifyVector3(AvatarRigComponent.rig[boneName].position, entity, bone.position)
        proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity, bone.quaternion)
      }
    }, [anim.rig])

    return null
  }
})
