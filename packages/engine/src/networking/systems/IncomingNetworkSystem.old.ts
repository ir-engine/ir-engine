import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { incomingNetworkReceptor } from '../functions/incomingNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { pipe } from 'bitecs'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { Group } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { avatarHalfHeight } from '../../avatar/functions/createAvatar'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { Action } from '../interfaces/Action'
import { deepEqual } from '../../common/functions/deepEqual'
import { Engine } from '../../ecs/classes/Engine'
import { validateNetworkObjects } from '../functions/validateNetworkObjects'
import { createDataReader } from '../serialization/AoS/DataReader'

export const updateCachedActions = (world: World, action: Required<Action>) => {
  if (action.$cache) {
    // see if we must remove any previous actions
    if (typeof action.$cache === 'boolean') {
      if (action.$cache) world.cachedActions.add(action)
    } else {
      const remove = action.$cache.removePrevious

      if (remove) {
        for (const a of world.cachedActions) {
          if (a.$from === action.$from && a.type === action.type) {
            if (remove === true) {
              world.cachedActions.delete(a)
            } else {
              let matches = true
              for (const key of remove) {
                if (!deepEqual(a[key], action[key])) {
                  matches = false
                  break
                }
              }
              if (matches) world.cachedActions.delete(a)
            }
          }
        }
      }

      if (!action.$cache.disable) world.cachedActions.add(action)
    }
  }
}

export const applyAndArchiveIncomingAction = (world: World, action: Required<Action>) => {
  try {
    for (const receptor of world.receptors) receptor(action)
    updateCachedActions(world, action)
    world.actionHistory.add(action)
  } catch (e) {
    world.actionHistory.add({ $ERROR: e, ...action } as any)
    console.error(e)
  } finally {
    world.incomingActions.delete(action)
  }
}

export const applyIncomingActions = (world: World) => {
  const { incomingActions } = world

  for (const action of incomingActions) {
    if (action.$tick > world.fixedTick) {
      continue
    }
    if (action.$tick < world.fixedTick) {
      console.warn(`LATE ACTION ${action.type}`, action)
    } else {
      console.log(`ACTION ${action.type}`, action)
    }
    applyAndArchiveIncomingAction(world, action)
  }

  return world
}

export const applyUnreliableQueue = (networkInstance: Network, deserialize: Function) => (world: World) => {
  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = networkInstance

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    // console.log('///////////IncomingNetworkSystem')
    // console.log(packet.byteLength)
    // console.log('////////////////////////////////')

    deserialize(world, packet)
  }
}

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  const deserialize = createDataReader()

  // prettier-ignore
  const applyIncomingNetworkState = pipe(
    applyIncomingActions,
    applyUnreliableQueue(Network.instance, deserialize)
  )

  world.receptors.push(incomingNetworkReceptor)

  const VALIDATE_NETWORK_INTERVAL = 300 // TODO: /** world.tickRate * 5 */

  return () => {
    if (!Engine.isInitialized) return

    applyIncomingNetworkState(world)

    if (Engine.userId === world.hostId && world.fixedTick % VALIDATE_NETWORK_INTERVAL === 0)
      validateNetworkObjects(world)
  }
}
