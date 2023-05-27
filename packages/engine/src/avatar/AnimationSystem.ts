import { useEffect } from 'react'
import { Euler } from 'three'

import { defineActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { changeAvatarAnimationState } from './animation/AvatarAnimationGraph'
import { AnimationComponent } from './components/AnimationComponent'

const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'

export function animationActionReceptor(action: ReturnType<typeof WorldNetworkAction.avatarAnimation>) {
  // Only run on other peers
  if (!Engine.instance.worldNetwork || Engine.instance.peerID === action.$peer) return

  const avatarEntity = Engine.instance.getUserAvatarEntity(action.$from)

  const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
  if (!networkObject) {
    return console.warn(`Avatar Entity for user id ${action.$from} does not exist! You should probably reconnect...`)
  }

  changeAvatarAnimationState(avatarEntity, action.newStateName)
}

const tweenQuery = defineQuery([TweenComponent])
const animationQuery = defineQuery([AnimationComponent, VisibleComponent])
const avatarAnimationQueue = defineActionQueue(WorldNetworkAction.avatarAnimation.matches)

const execute = () => {
  const { deltaSeconds } = Engine.instance

  for (const action of avatarAnimationQueue()) animationActionReceptor(action)

  for (const entity of tweenQuery()) {
    const tween = getComponent(entity, TweenComponent)
    tween.update()
  }

  for (const entity of animationQuery()) {
    const animationComponent = getComponent(entity, AnimationComponent)
    const modifiedDelta = deltaSeconds * animationComponent.animationSpeed
    animationComponent.mixer.update(modifiedDelta)
    TransformComponent.dirtyTransforms[entity] = true
  }
}

export const AnimationSystem = defineSystem({
  uuid: 'ee.engine.AnimationSystem',
  execute
})
