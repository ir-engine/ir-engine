import matches from 'ts-matches'

import { World } from '../ecs/classes/World'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { IKRigComponent } from '../ikrig/components/IKRigComponent'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { AnimationManager } from './AnimationManager'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'

const animationQuery = defineQuery([AnimationComponent])
const avatarAnimationQuery = defineQuery([AnimationComponent, IKRigComponent, AvatarAnimationComponent])

export default async function AnimationSystem(world: World) {
  world.receptors.push(animationActionReceptor)

  function animationActionReceptor(action) {
    matches(action).when(NetworkWorldAction.avatarAnimation.matches, ({ $from }) => {
      const avatarEntity = world.getUserAvatarEntity($from)
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
