import { Bone, Euler, MathUtils, Vector3 } from 'three'

import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { DesiredTransformComponent } from '../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { updateAnimationGraph } from './animation/AnimationGraph'
import { changeAvatarAnimationState } from './animation/AvatarAnimationGraph'
import { AnimationManager } from './AnimationManager'
import AvatarHandAnimationSystem from './AvatarHandAnimationSystem'
import AvatarIKTargetSystem from './AvatarIKTargetSystem'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './components/AvatarAnimationComponent'

const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'
const _vector3 = new Vector3()

export function animationActionReceptor(
  action: ReturnType<typeof WorldNetworkAction.avatarAnimation>,
  world = Engine.instance.currentWorld
) {
  if (Engine.instance.userId === action.$from) return // Only run on other clients
  const avatarEntity = world.getUserAvatarEntity(action.$from)

  const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
  if (!networkObject) {
    return console.warn(`Avatar Entity for user id ${action.$from} does not exist! You should probably reconnect...`)
  }

  changeAvatarAnimationState(avatarEntity, action.newStateName)
}

export default async function AnimationSystem(world: World) {
  const desiredTransformQuery = defineQuery([DesiredTransformComponent])
  const tweenQuery = defineQuery([TweenComponent])
  const animationQuery = defineQuery([AnimationComponent])
  const movingAvatarAnimationQuery = defineQuery([
    AnimationComponent,
    AvatarAnimationComponent,
    AvatarRigComponent,
    VelocityComponent
  ])
  const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])
  const avatarAnimationQueue = createActionQueue(WorldNetworkAction.avatarAnimation.matches)

  await AnimationManager.instance.loadDefaultAnimations()

  const execute = () => {
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

    /** Apply motion to velocity controlled animations */
    for (const entity of movingAvatarAnimationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      const velocity = getComponent(entity, VelocityComponent)

      // TODO: use x locomotion for side-stepping when full 2D blending spaces are implemented
      avatarAnimationComponent.locomotion.x = 0
      avatarAnimationComponent.locomotion.y = velocity.linear.y
      // lerp animated forward animation to smoothly animate to a stop
      avatarAnimationComponent.locomotion.z = MathUtils.lerp(
        avatarAnimationComponent.locomotion.z || 0,
        _vector3.copy(velocity.linear).setComponent(1, 0).length(),
        10 * deltaTime
      )

      updateAnimationGraph(avatarAnimationComponent.animationGraph, deltaTime)
    }

    /**
     * Apply retargeting
     */
    for (const entity of avatarAnimationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
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
  }

  const cleanup = async () => {
    removeQuery(world, desiredTransformQuery)
    removeQuery(world, tweenQuery)
    removeQuery(world, animationQuery)
    removeQuery(world, movingAvatarAnimationQuery)
    removeQuery(world, avatarAnimationQuery)
    removeActionQueue(avatarAnimationQueue)
  }

  return {
    execute,
    cleanup,
    subsystems: [
      () => Promise.resolve({ default: AvatarIKTargetSystem }),
      () => Promise.resolve({ default: AvatarHandAnimationSystem })
    ]
  }
}
