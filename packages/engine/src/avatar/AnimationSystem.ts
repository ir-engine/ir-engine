import { Bone, Euler, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { Axis } from '../common/constants/Axis3D'
import { Engine } from '../ecs/classes/Engine'
import { getEngineState } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { DesiredTransformComponent } from '../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { changeAvatarAnimationState } from './animation/AvatarAnimationGraph'
import { getForwardVector, solveLookIK } from './animation/LookAtIKSolver'
import { solveTwoBoneIK } from './animation/TwoBoneIKSolver'
import { AnimationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarHandsIKComponent } from './components/AvatarHandsIKComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import { AvatarHeadIKComponent } from './components/AvatarHeadIKComponent'

const EPSILON = 1e-6
const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'

export function animationActionReceptor(
  action: ReturnType<typeof WorldNetworkAction.avatarAnimation>,
  world = Engine.instance.currentWorld
) {
  const avatarEntity = world.getUserAvatarEntity(action.$from)
  if (isEntityLocalClient(avatarEntity)) return // Only run on other clients

  const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
  if (!networkObject) {
    return console.warn(`Avatar Entity for user id ${action.$from} does not exist! You should probably reconnect...`)
  }

  changeAvatarAnimationState(avatarEntity, action.newStateName)
}

export default async function AnimationSystem(world: World) {
  const vrIKQuery = defineQuery([AvatarHandsIKComponent, AvatarAnimationComponent])
  const headIKQuery = defineQuery([AvatarHeadIKComponent, AvatarAnimationComponent])
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])
  const desiredTransformQuery = defineQuery([DesiredTransformComponent])
  const tweenQuery = defineQuery([TweenComponent])
  const animationQuery = defineQuery([AnimationComponent])
  const forward = new Vector3()
  const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent])

  const avatarAnimationQueue = createActionQueue(WorldNetworkAction.avatarAnimation.matches)

  await AnimationManager.instance.loadDefaultAnimations()

  return () => {
    const { deltaSeconds: delta } = world

    for (const action of avatarAnimationQueue()) animationActionReceptor(action, world)

    for (const entity of desiredTransformQuery(world)) {
      const desiredTransform = getComponent(entity, DesiredTransformComponent)

      const mutableTransform = getComponent(entity, TransformComponent)
      mutableTransform.position.lerp(desiredTransform.position, desiredTransform.positionRate * delta)

      // store rotation before interpolation
      euler1YXZ.setFromQuaternion(mutableTransform.rotation)
      // lerp to desired rotation

      mutableTransform.rotation.slerp(desiredTransform.rotation, desiredTransform.rotationRate * delta)
      euler2YXZ.setFromQuaternion(mutableTransform.rotation)
      // use axis locks - yes this is correct, the axis order is weird because quaternions
      if (desiredTransform.lockRotationAxis[0]) {
        euler2YXZ.x = euler1YXZ.x
      }
      if (desiredTransform.lockRotationAxis[2]) {
        euler2YXZ.y = euler1YXZ.y
      }
      if (desiredTransform.lockRotationAxis[1]) {
        euler2YXZ.z = euler1YXZ.z
      }
      mutableTransform.rotation.setFromEuler(euler2YXZ)
    }

    for (const entity of tweenQuery(world)) {
      const tween = getComponent(entity, TweenComponent)
      tween.tween.update()
    }

    for (const entity of animationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const modifiedDelta = delta * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)
    }

    for (const entity of avatarAnimationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      updateAnimationGraph(avatarAnimationComponent.animationGraph, deltaTime)

      const rootBone = animationComponent.mixer.getRoot() as Bone
      const rig = avatarAnimationComponent.rig

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
      if (avatarAnimationComponent.rig.Hips) avatarAnimationComponent.rig.Hips.position.setX(rootPos.x).setZ(rootPos.z)
    }

    for (const entity of vrIKQuery()) {
      const ik = getComponent(entity, AvatarHandsIKComponent)
      const { rig } = getComponent(entity, AvatarAnimationComponent)

      if (!rig) continue

      // Arms should not be straight for the solver to work properly
      // TODO: Make this configurable
      rig.LeftForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * -0.25)
      rig.RightForeArm.quaternion.setFromAxisAngle(Axis.X, Math.PI * 0.25)
      rig.LeftForeArm.updateWorldMatrix(false, true)
      rig.RightForeArm.updateWorldMatrix(false, true)

      solveTwoBoneIK(
        rig.LeftArm,
        rig.LeftForeArm,
        rig.LeftHand,
        ik.leftTarget,
        ik.leftHint,
        ik.leftTargetOffset,
        ik.leftTargetPosWeight,
        ik.leftTargetRotWeight,
        ik.leftHintWeight
      )
      solveTwoBoneIK(
        rig.RightArm,
        rig.RightForeArm,
        rig.RightHand,
        ik.rightTarget,
        ik.rightHint,
        ik.rightTargetOffset,
        ik.rightTargetPosWeight,
        ik.rightTargetRotWeight,
        ik.rightHintWeight
      )
    }

    for (const entity of headIKQuery(world)) {
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      const ik = getComponent(entity, AvatarHeadIKComponent)
      getForwardVector(ik.camera.matrixWorld, forward).multiplyScalar(-1)
      solveLookIK(rig.Head, forward, ik.rotationClamp)
    }

    for (const entity of headDecapQuery(world)) {
      if (!hasComponent(entity, AvatarAnimationComponent)) continue
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      rig.Head.scale.setScalar(EPSILON)
    }

    for (const entity of headDecapQuery.exit(world)) {
      if (!hasComponent(entity, AvatarAnimationComponent)) continue
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      rig.Head.scale.setScalar(1)
    }
  }
}
