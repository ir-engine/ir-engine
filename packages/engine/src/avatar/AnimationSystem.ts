import { Euler } from 'three'

import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { changeAvatarAnimationState } from './animation/AvatarAnimationGraph'
import { AnimationComponent } from './components/AnimationComponent'

const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'

export function animationActionReceptor(action: ReturnType<typeof WorldNetworkAction.avatarAnimation>) {
  // Only run on other peers
  if (!Engine.instance.worldNetwork || !action.$peer || Engine.instance.worldNetwork.peerID === action.$peer) return

  const avatarEntity = Engine.instance.getUserAvatarEntity(action.$from)

  const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
  if (!networkObject) {
    return console.warn(`Avatar Entity for user id ${action.$from} does not exist! You should probably reconnect...`)
  }

  changeAvatarAnimationState(avatarEntity, action.newStateName)
}

export default async function AnimationSystem() {
  const tweenQuery = defineQuery([TweenComponent])
  const animationQuery = defineQuery([AnimationComponent, VisibleComponent])
  const avatarAnimationQueue = createActionQueue(WorldNetworkAction.avatarAnimation.matches)

  const execute = () => {
    const { deltaSeconds } = Engine.instance

    for (const action of avatarAnimationQueue()) animationActionReceptor(action)

    for (const entity of tweenQuery()) {
      const tween = getComponent(entity, TweenComponent)
      tween.tween.update()
    }

    for (const entity of animationQuery()) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const modifiedDelta = deltaSeconds * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)
    }
  }

  const cleanup = async () => {
    removeQuery(tweenQuery)
    removeQuery(animationQuery)
    removeActionQueue(avatarAnimationQueue)
  }

  return {
    execute,
    cleanup,
    subsystems: []
  }
}
