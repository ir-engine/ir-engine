import { deepEqual } from '../../common/functions/deepEqual'
import { World } from '../classes/World'
import { Action } from './Action'

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

export default async function ActionDispatchSystem(world: World) {
  return () => {
    applyIncomingActions(world)
  }
}
