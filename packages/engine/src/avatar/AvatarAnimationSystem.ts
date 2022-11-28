import { clamp } from 'lodash'
import { Bone, MathUtils, Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { V_000 } from '../common/constants/MathConstants'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, getOptionalComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { createPriorityQueue } from '../ecs/PriorityQueue'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { GroupComponent } from '../scene/components/GroupComponent'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../transform/components/DistanceComponents'
import { TransformComponent } from '../transform/components/TransformComponent'
import { updateGroupChildren } from '../transform/systems/TransformSystem'
import { XRControllerComponent } from '../xr/XRComponents'
import { getControlMode, XRState } from '../xr/XRState'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { AnimationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarLeftHandIKComponent, AvatarRightHandIKComponent } from './components/AvatarIKComponents'
import { AvatarHeadDecapComponent } from './components/AvatarIKComponents'
import { AvatarHeadIKComponent } from './components/AvatarIKComponents'
import { LoopAnimationComponent } from './components/LoopAnimationComponent'

const _vector3 = new Vector3()
const _vec = new Vector3()
const _rotXneg60 = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 1.5)
const _rotY90 = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2)
const _rotYneg90 = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2)

// todo
// function noop() {}

// function iterateSkeletons(skinnedMesh: SkinnedMesh) {
//   if (skinnedMesh.isSkinnedMesh) {
//     skinnedMesh.skeleton.update()
//   }
// }

export default async function AvatarAnimationSystem(world: World) {
  const leftHandQuery = defineQuery([AvatarLeftHandIKComponent, AvatarRigComponent])
  const rightHandQuery = defineQuery([AvatarRightHandIKComponent, AvatarRigComponent])
  const headIKQuery = defineQuery([AvatarHeadIKComponent, AvatarRigComponent])
  const localHeadIKQuery = defineQuery([AvatarHeadIKComponent, AvatarControllerComponent])
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])
  const armsTwistCorrectionQuery = defineQuery([AvatarArmsTwistCorrectionComponent, AvatarRigComponent])
  const loopAnimationQuery = defineQuery([
    LoopAnimationComponent,
    AnimationComponent,
    AvatarAnimationComponent,
    AvatarRigComponent
  ])
  const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])

  /** override Skeleton.update, as it is called inside  */
  // const skeletonUpdate = Skeleton.prototype.update

  const maxSqrDistance = 25 * 25
  const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units
  const minAccumulationRate = 0.01
  const maxAccumulationRate = 0.1
  const priorityQueue = createPriorityQueue(avatarAnimationQuery(), { priorityThreshold: maxAccumulationRate })

  world.priorityAvatarEntities = priorityQueue.priorityEntities
  const filterPriorityEntities = (entity: Entity) => world.priorityAvatarEntities.has(entity)

  const xrState = getState(XRState)

  const execute = () => {
    const { localClientEntity, elapsedSeconds, deltaSeconds } = world
    const inAttachedControlMode = getControlMode() === 'attached'

    for (const entity of avatarAnimationQuery()) {
      /**
       * if outside of frustum, priority get set to 0 otherwise
       * whatever your distance is, gets mapped linearly to your priority
       */
      const sqrDistance = DistanceFromCameraComponent.squaredDistance[entity]
      // min distance to ensure entities that might be overlapping the camera are not frustum culled
      if (sqrDistance > minimumFrustumCullDistanceSqr && FrustumCullCameraComponent.isCulled[entity]) {
        priorityQueue.setPriority(entity, 0)
      } else {
        const accumulation = clamp(
          (maxSqrDistance / sqrDistance) * deltaSeconds,
          minAccumulationRate,
          maxAccumulationRate
        )
        priorityQueue.addPriority(entity, accumulation)
      }
    }

    priorityQueue.update()

    const avatarAnimationEntities = avatarAnimationQuery(world).filter(filterPriorityEntities)
    const headIKEntities = headIKQuery(world).filter(filterPriorityEntities)
    const leftHandEntities = leftHandQuery(world).filter(filterPriorityEntities)
    const rightHandEntities = rightHandQuery(world).filter(filterPriorityEntities)
    const loopAnimationEntities = loopAnimationQuery(world).filter(filterPriorityEntities)

    for (const entity of avatarAnimationEntities) {
      /**
       * Apply motion to velocity controlled animations
       */
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)

      const delta = elapsedSeconds - avatarAnimationComponent.deltaAccumulator
      const deltaTime = delta * animationComponent.animationSpeed
      avatarAnimationComponent.deltaAccumulator = elapsedSeconds

      if (rigidbodyComponent) {
        // TODO: use x locomotion for side-stepping when full 2D blending spaces are implemented
        avatarAnimationComponent.locomotion.x = 0
        avatarAnimationComponent.locomotion.y = rigidbodyComponent.linearVelocity.y
        // lerp animated forward animation to smoothly animate to a stop
        avatarAnimationComponent.locomotion.z = MathUtils.lerp(
          avatarAnimationComponent.locomotion.z || 0,
          _vector3.copy(rigidbodyComponent.linearVelocity).setComponent(1, 0).length(),
          10 * deltaTime
        )
      } else {
        avatarAnimationComponent.locomotion.setScalar(0)
      }

      /**
       * Update animation graph
       */
      updateAnimationGraph(avatarAnimationComponent.animationGraph, deltaTime)

      /**
       * Apply retargeting
       */
      const rootBone = animationComponent.mixer.getRoot() as Bone
      const avatarRigComponent = getComponent(entity, AvatarRigComponent)
      const rig = avatarRigComponent.rig

      rootBone.traverse((bone: Bone) => {
        if (!bone.isBone) return

        const targetBone = rig[bone.name]
        if (!targetBone) {
          return
        }

        targetBone.quaternion.copy(bone.quaternion)

        // Only copy the root position
        if (targetBone === rig.Hips) {
          targetBone.position.copy(bone.position)
          targetBone.position.y *= avatarAnimationComponent.rootYRatio
        }
      })

      // TODO: Find a more elegant way to handle root motion
      const rootPos = AnimationManager.instance._defaultRootBone.position
      rig.Hips.position.setX(rootPos.x).setZ(rootPos.z)
    }

    /**
     * Apply head IK
     */
    for (const entity of headIKEntities) {
      const ik = getComponent(entity, AvatarHeadIKComponent)
      if (inAttachedControlMode && entity === localClientEntity) {
        ik.target.quaternion.copy(world.camera.quaternion)
        ik.target.position.copy(world.camera.position)
      }
      ik.target.updateMatrix()
      ik.target.updateMatrixWorld(true)
      const rig = getComponent(entity, AvatarRigComponent).rig
      ik.target.getWorldDirection(_vec).multiplyScalar(-1)
      solveLookIK(rig.Head, _vec, ik.rotationClamp)
    }

    /**
     * Apply left hand IK
     */
    for (const entity of leftHandEntities) {
      const { rig } = getComponent(entity, AvatarRigComponent)

      const ik = getComponent(entity, AvatarLeftHandIKComponent)
      if (entity === localClientEntity) {
        const leftControllerEntity = xrState.leftControllerEntity.value
        if (leftControllerEntity) {
          const controller = getComponent(leftControllerEntity, XRControllerComponent)
          if (controller.hand) {
            const { position, rotation } = getComponent(controller.hand, TransformComponent)
            ik.target.position.copy(position)
            ik.target.quaternion.copy(rotation).multiply(_rotYneg90)
          } else if (controller.grip) {
            const { position, rotation } = getComponent(controller.grip, TransformComponent)
            ik.target.position.copy(position)
            /**
             * Since the hand has Z- forward in the grip space,
             *    which is roughly 60 degrees rotated from the arm's forward,
             *    apply a rotation to get the correct hand orientation
             */
            ik.target.quaternion.copy(rotation).multiply(_rotXneg60)
          } else {
            const { position, rotation } = getComponent(leftControllerEntity, TransformComponent)
            ik.target.position.copy(position)
            ik.target.quaternion.copy(rotation)
          }
        }
      }
      ik.target.updateMatrix()
      ik.target.updateMatrixWorld(true)

      // Arms should not be straight for the solver to work properly
      // TODO: Make this configurable

      // TODO: should we break hand IK apart into left and right components?
      // some devices only support one hand controller. How do we handle that?
      // how do we report that tracking is lost or still pending?
      // FOR NOW: we'll assume that we don't have tracking if the target is at exactly (0, 0, 0);
      // we may want to add a flag for this in the future, or to generally allow animations to play even if tracking is available

      if (!ik.target.position.equals(V_000)) {
        rig.LeftForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * -0.25)
        rig.LeftForeArm.updateWorldMatrix(false, true)
        solveTwoBoneIK(
          rig.LeftArm,
          rig.LeftForeArm,
          rig.LeftHand,
          ik.target,
          ik.hint,
          ik.targetOffset,
          ik.targetPosWeight,
          ik.targetRotWeight,
          ik.hintWeight
        )
      }
    }

    /**
     * Apply right hand IK
     */
    for (const entity of rightHandEntities) {
      const { rig } = getComponent(entity, AvatarRigComponent)

      const ik = getComponent(entity, AvatarRightHandIKComponent)

      if (entity === localClientEntity) {
        const rightControllerEntity = xrState.rightControllerEntity.value
        if (rightControllerEntity) {
          const controller = getComponent(rightControllerEntity, XRControllerComponent)
          if (controller.hand) {
            const { position, rotation } = getComponent(controller.hand, TransformComponent)
            ik.target.position.copy(position)
            ik.target.quaternion.copy(rotation).multiply(_rotY90)
          } else if (controller.grip) {
            const { position, rotation } = getComponent(controller.grip, TransformComponent)
            ik.target.position.copy(position)
            /**
             * Since the hand has Z- forward in the grip space,
             *    which is roughly 60 degrees rotated from the arm's forward,
             *    apply a rotation to get the correct hand orientation
             */
            ik.target.quaternion.copy(rotation).multiply(_rotXneg60)
          } else {
            const { position, rotation } = getComponent(rightControllerEntity, TransformComponent)
            ik.target.position.copy(position)
            ik.target.quaternion.copy(rotation)
          }
        }
      }
      ik.target.updateMatrix()
      ik.target.updateMatrixWorld(true)

      if (!ik.target.position.equals(V_000)) {
        rig.RightForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)
        rig.RightForeArm.updateWorldMatrix(false, true)
        solveTwoBoneIK(
          rig.RightArm,
          rig.RightForeArm,
          rig.RightHand,
          ik.target,
          ik.hint,
          ik.targetOffset,
          ik.targetPosWeight,
          ik.targetRotWeight,
          ik.hintWeight
        )
      }
    }

    // for (const entity of armsTwistCorrectionQuery.enter()) {
    //   const { bindRig } = getComponent(entity, AvatarRigComponent)
    //   const twistCorrection = getComponent(entity, AvatarArmsTwistCorrectionComponent)
    //   twistCorrection.LeftHandBindRotationInv.copy(bindRig.LeftHand.quaternion).invert()
    //   twistCorrection.RightHandBindRotationInv.copy(bindRig.RightHand.quaternion).invert()
    // }

    // for (const entity of armsTwistCorrectionQuery()) {
    //   const { rig, bindRig } = getComponent(entity, AvatarRigComponent)
    //   const twistCorrection = getComponent(entity, AvatarArmsTwistCorrectionComponent)

    //   if (rig.LeftForeArmTwist) {
    //     applyBoneTwist(
    //       twistCorrection.LeftHandBindRotationInv,
    //       rig.LeftHand.quaternion,
    //       bindRig.LeftForeArmTwist.quaternion,
    //       rig.LeftForeArmTwist.quaternion,
    //       twistCorrection.LeftArmTwistAmount
    //     )
    //   }

    //   if (rig.RightForeArmTwist) {
    //     applyBoneTwist(
    //       twistCorrection.RightHandBindRotationInv,
    //       rig.RightHand.quaternion,
    //       bindRig.RightForeArmTwist.quaternion,
    //       rig.RightForeArmTwist.quaternion,
    //       twistCorrection.RightArmTwistAmount
    //     )
    //   }
    // }

    /**
     * Since the scene does not automatically update the matricies for all objects,which updates bones,
     * we need to manually do it for Loop Animation Entities
     */
    for (const entity of loopAnimationEntities) updateGroupChildren(entity)

    /**
     * Update threejs skeleton manually
     *  - overrides default behaviour in WebGLRenderer.render, calculating mat4 multiplcation
     * @todo this causes significant visual artefacts
     */

    // Skeleton.prototype.update = skeletonUpdate
    // for (const entity of world.priorityAvatarEntities) {
    //   const group = getComponent(entity, GroupComponent)
    //   for (const obj of group)
    //     obj.traverse(iterateSkeletons)
    // }
    // Skeleton.prototype.update = noop
  }

  const cleanup = async () => {
    removeQuery(world, headDecapQuery)
    removeQuery(world, leftHandQuery)
    removeQuery(world, rightHandQuery)
    removeQuery(world, localHeadIKQuery)
    removeQuery(world, headIKQuery)
    removeQuery(world, armsTwistCorrectionQuery)
    removeQuery(world, avatarAnimationQuery)
    // Skeleton.prototype.update = skeletonUpdate
  }

  return { execute, cleanup }
}
