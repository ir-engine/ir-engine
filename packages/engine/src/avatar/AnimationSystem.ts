import { Euler } from 'three'
import matches from 'ts-matches'

import { World } from '../ecs/classes/World'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { IKRigComponent } from '../ikrig/components/IKRigComponent'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { DesiredTransformComponent } from '../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { AnimationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'

const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'

const desiredTransformQuery = defineQuery([DesiredTransformComponent])
const tweenQuery = defineQuery([TweenComponent])
const animationQuery = defineQuery([AnimationComponent])
const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, IKRigComponent])

export default async function AnimationSystem(world: World) {
  world.receptors.push(animationActionReceptor)

  function animationActionReceptor(action) {
    matches(action).when(NetworkWorldAction.avatarAnimation.matches, ({ $from }) => {
      const avatarEntity = world.getUserAvatarEntity($from)
      if (isEntityLocalClient(avatarEntity)) return // Only run on other clients

      const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
      if (!networkObject) {
        return console.warn(`Avatar Entity for user id ${$from} does not exist! You should probably reconnect...`)
      }

      const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)
      avatarAnimationComponent.animationGraph.changeState(action.newStateName)
    })
  }

  await AnimationManager.instance.getDefaultAnimations()

  return () => {
    const { delta } = world

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
      avatarAnimationComponent.animationGraph.update(deltaTime)

      // TODO: Find a more elegant way to handle root motion
      const bones = getComponent(entity, IKRigComponent).boneStructure
      const rootPos = AnimationManager.instance._defaultRootBone.position
      bones.Hips.position.setX(rootPos.x).setZ(rootPos.z)
    }
  }
}
