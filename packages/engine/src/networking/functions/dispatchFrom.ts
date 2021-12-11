import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '../../ecs/classes/Engine'
import { Action, ActionCacheOptions, ActionRecipients } from '../interfaces/Action'

/**
 * Dispatch an action from a given user.
 * This function is a no-op for every other user.
 *
 * By default, the action is dispatched to every other user,
 * on the next simulation tick. These defaults can be overriden
 * using the `to()` and `delay()` modifiers.
 */
export const dispatchFrom = (userId: UserId, actionCb: () => Action) => {
  let action!: Action
  if (Engine.userId === userId) {
    action = actionCb()
    action.$from = action.$from ?? Engine.userId
    action.$to = action.$to ?? 'all'
    action.$tick = action.$tick ?? Engine.currentWorld.fixedTick + 2
    Engine.currentWorld.outgoingActions.add(action)
  }
  return _createModifier(action)
}

function _createModifier(action: Action) {
  const modifier = {
    /**
     * Dispatch to select recipients
     */
    to(to: ActionRecipients) {
      if (action) action.$to = to
      return modifier
    },
    /**
     * Dispatch on a future tick
     * @param tickOffset The number of ticks in the future specifying when this action should be dispatched.
     * Default is 2 ticks in the future
     */
    delay(tickOffset: number) {
      if (action) action.$tick = Engine.currentWorld.fixedTick + tickOffset
      return modifier
    },
    /**
     * Cache this action to replay for clients that join late
     *
     * @param cache The cache options
     * - Default: true
     */
    cache(cache = true as ActionCacheOptions) {
      if (action) action.$cache = cache
      return modifier
    }
  }
  return modifier
}

const dispatch = (action: Action) => {
  const world = Engine.currentWorld
  action.$from = action.$from ?? Engine.userId
  action.$to = action.$to ?? 'all'
  action.$tick = action.$tick ?? world.fixedTick + 2
  world.outgoingActions.add(action)
  return _createModifier(action)
}

export const dispatchLocal = (action: Action) => {
  return dispatch(action).to('local')
}
