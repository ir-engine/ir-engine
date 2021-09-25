import { Vector3 } from 'three'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationGraph } from './animations/AvatarAnimationGraph'
import { AvatarStates } from './animations/Util'
import { AnimationRenderer } from './animations/AnimationRenderer'
import { loadAvatar } from './functions/avatarFunctions'
import { AnimationManager } from './AnimationManager'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { Network } from '../networking/classes/Network'
import { AnimationGraph } from './animations/AnimationGraph'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'
import { Engine } from '../ecs/classes/Engine'

function animationActionReceptor(action: IncomingAction<typeof NetworkWorldAction>) {
  switch (action.type) {
    case NetworkWorldAction.ANIMATION_CHANGE: {
      if (!Network.instance.objects[action.networkId]) {
        return console.warn(`Entity with id ${action.networkId} does not exist! You should probably reconnect...`)
      }
      if (Network.instance.objects[action.networkId].uniqueId === Engine.userId) return
      const entity = Network.instance.objects[action.networkId].entity
      action.params.forceTransition = true
      AnimationGraph.forceUpdateAnimationState(entity, action.newStateName, action.params)
    }
  }
}

const animationQuery = defineQuery([AnimationComponent])
const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent])

export default async function AnimationSystem(world: World): Promise<System> {
  // world.receptors.add(animationActionReceptor)

  await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])

  return () => {
    const { delta } = world

    for (const entity of animationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const modifiedDelta = delta * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)
    }

    for (const entity of avatarAnimationQuery.enter(world)) {
      loadAvatar(entity)
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
