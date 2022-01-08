import { Vector3 } from 'three'
import matches from 'ts-matches'

import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { AnimationManager } from './AnimationManager'
import { AnimationGraph } from './animations/AnimationGraph'
import { AnimationRenderer } from './animations/AnimationRenderer'
import { AvatarAnimationGraph } from './animations/AvatarAnimationGraph'
import { AvatarStates } from './animations/Util'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'

const animationQuery = defineQuery([AnimationComponent])
const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent])

export default async function AnimationSystem(world: World): Promise<System> {
  world.receptors.push(animationActionReceptor)

  function animationActionReceptor(action) {
    matches(action).when(NetworkWorldAction.avatarAnimation.matches, ({ $from }) => {
      if ($from === Engine.userId) {
        return
      }

      const avatarEntity = world.getUserAvatarEntity($from)
      const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
      if (!networkObject) {
        return console.warn(`Avatar Entity for user id ${$from} does not exist! You should probably reconnect...`)
      }
      action.params.forceTransition = true
      AnimationGraph.forceUpdateAnimationState(avatarEntity, action.newStateName, action.params)
    })
  }

  await AnimationManager.instance.getAnimations()

  return () => {
    const { delta } = world

    for (const entity of animationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const modifiedDelta = delta * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)
    }

    for (const entity of avatarAnimationQuery.enter(world)) {
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      avatarAnimationComponent.animationGraph = new AvatarAnimationGraph()
      avatarAnimationComponent.currentState = avatarAnimationComponent.animationGraph.states[AvatarStates.IDLE]
      avatarAnimationComponent.prevVelocity = new Vector3()
      AnimationRenderer.mountCurrentState(entity)
    }

    for (const entity of avatarAnimationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      avatarAnimationComponent.animationGraph.render(entity, deltaTime)
      AnimationRenderer.render(entity, delta)
    }
  }
}
