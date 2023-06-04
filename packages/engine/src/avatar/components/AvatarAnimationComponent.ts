import { VRM, VRMHumanBoneList, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import {
  AxesHelper,
  Euler,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  SkeletonHelper,
  SkinnedMesh,
  SphereGeometry,
  Vector3
} from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import {
  defineComponent,
  getMutableComponent,
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
import { AnimationComponent } from './AnimationComponent'
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

export interface ikTargets {
  rightHandTarget: Object3D
  leftHandTarget: Object3D
  rightFootTarget: Object3D
  leftFootTarget: Object3D
  headTarget: Object3D

  rightElbowHint: Object3D
  leftElbowHint: Object3D
  rightKneeHint: Object3D
  leftKneeHint: Object3D
  headHint: Object3D
}

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
      /** The length of the torso in a t-pose, from the hip joint to the head joint */
      torsoLength: 0,
      /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
      upperLegLength: 0,
      /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
      lowerLegLength: 0,
      /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
      footHeight: 0,

      armLength: 0,

      /** Cache of the skinned meshes currently on the rig */
      skinnedMeshes: [] as SkinnedMesh[],
      /** The VRM model */
      vrm: null! as VRM,

      targets: new Object3D(),
      ikTargetsMap: {
        rightHandTarget: new Object3D(),
        leftHandTarget: new Object3D(),
        rightFootTarget: new Object3D(),
        leftFootTarget: new Object3D(),
        headTarget: new Object3D(),

        rightElbowHint: new Object3D(),
        leftElbowHint: new Object3D(),
        rightKneeHint: new Object3D(),
        leftKneeHint: new Object3D(),
        headHint: new Object3D()
      } as ikTargets,

      ikOffsetsMap: new Map<string, Vector3>()
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
    const rigComponent = getMutableComponent(entity, AvatarRigComponent)

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

    const animComponent = useComponent(entity, AnimationComponent)

    //Calculate ik target offsets for retargeting
    useEffect(() => {
      if (!animComponent.animations.value.length || !rigComponent.targets.children.length) return
      const bindTracks = animComponent.animations[0].tracks.value
      if (!bindTracks) return
      for (let i = 0; i < bindTracks.length; i += 3) {
        const key = bindTracks[i].name.substring(0, bindTracks[i].name.indexOf('.'))
        const hipsRotationoffset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

        //todo: find a better way to map joints to ik targets here
        const bonePos = new Matrix4()
        switch (key) {
          case 'rightHandTarget':
            rigComponent.bindRig.rightHand.value.node.updateMatrixWorld()
            bonePos.copy(rigComponent.bindRig.rightHand.value.node.matrixWorld)
            break
          case 'leftHandTarget':
            rigComponent.bindRig.leftHand.value.node.updateMatrixWorld()
            bonePos.copy(rigComponent.bindRig.leftHand.value.node.matrixWorld)
            break
          case 'rightFootTarget':
            rigComponent.bindRig.rightFoot.value.node.updateMatrixWorld()
            bonePos.copy(rigComponent.bindRig.rightFoot.value.node.matrixWorld)
            break
          case 'leftFootTarget':
            rigComponent.bindRig.leftFoot.value.node.updateMatrixWorld()
            bonePos.copy(rigComponent.bindRig.leftFoot.value.node.matrixWorld)
            break
          case 'rightElbowHint':
            bonePos.copy(rigComponent.bindRig.rightLowerArm.value.node.matrixWorld)
            break
          case 'leftElbowHint':
            bonePos.copy(rigComponent.bindRig.leftLowerArm.value.node.matrixWorld)
            break
          case 'rightKneeHint':
            bonePos.copy(rigComponent.bindRig.rightLowerLeg.value.node.matrixWorld)
            break
          case 'leftKneeHint':
            bonePos.copy(rigComponent.bindRig.leftLowerLeg.value.node.matrixWorld)
            break
          case 'headHint':
          case 'headTarget':
            bonePos.copy(rigComponent.bindRig.head.value.node.matrixWorld)
        }
        const pos = new Vector3()
        bonePos.decompose(pos, new Quaternion(), new Vector3())
        pos.applyQuaternion(hipsRotationoffset)
        pos.sub(new Vector3(bindTracks[i].values[0], bindTracks[i].values[1], bindTracks[i].values[2]))
        rigComponent.ikOffsetsMap.value.set(key, pos)
      }
    }, [animComponent.animations, rigComponent.targets])
    return null
  }
})
