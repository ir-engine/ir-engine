import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { isClient } from '../common/functions/isClient'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'

const EPSILON = 1e-6

export function avatarDetailsReceptor(
  action: ReturnType<typeof WorldNetworkAction.avatarDetails>,
  world = Engine.instance.currentWorld
) {
  const userAvatarDetails = getState(WorldState).userAvatarDetails
  userAvatarDetails[action.$from].set(action.avatarDetail)
  if (isClient) {
    const entity = world.getUserAvatarEntity(action.$from)
    loadAvatarForUser(entity, action.avatarDetail.avatarURL)
  }
}

export default async function AvatarSystem(world: World) {
  const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])

  const execute = () => {
    for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)

    for (const entity of headDecapQuery(world)) {
      if (!hasComponent(entity, AvatarAnimationComponent)) continue
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      rig.Head?.scale.setScalar(EPSILON)
    }

    for (const entity of headDecapQuery.exit(world)) {
      if (!hasComponent(entity, AvatarAnimationComponent)) continue
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      rig.Head?.scale.setScalar(1)
    }
  }

  const cleanup = async () => {
    removeActionQueue(avatarDetailsQueue)
    removeQuery(world, headDecapQuery)
  }

  return { execute, cleanup, subsystems: [] }
}
