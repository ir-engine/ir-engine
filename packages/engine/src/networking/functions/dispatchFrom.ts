import { HostUserId, UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '../../ecs/classes/Engine'
import { Action, ActionRecipients } from '../interfaces/Action'

type AllowedUser<A> = A extends { __ALLOW_DISPATCH_FROM_ANY: true } ? UserId : HostUserId

/**
 * Dispatch an action from a given user.
 * This function is a no-op for every other user.
 *
 * By default, the action is dispatched to every other user,
 * on the next simulation tick. These defaults can be overriden
 * using the `to()` and `delay()` modifiers.
 */
export const dispatchFrom = <A extends Action, U extends AllowedUser<A>>(userId: U, actionCb: () => A) => {
  let action!: A
  const world = Engine.defaultWorld

  const options = {
    /**
     * Dispatch to select recipients
     */
    to(to: ActionRecipients) {
      if (!action) return
      action.$to = to
      return options
    },
    /**
     * Dispatch on a future tick
     * @param tickOffset The number of ticks in the future specifying when this action should be dispatched.
     * Default is 2 ticks in the future
     */
    delay(tickOffset: number) {
      if (!action) return
      action.$tick = world.fixedTick + tickOffset
      return options
    }
  }

  if (Engine.userId !== userId) return options

  action = actionCb()
  action.$to = action.$to ?? 'all'
  action.$tick = action.$tick ?? world.fixedTick + 2
  world.outgoingActions.add(action)
  return options
}

export const dispatchLocal = (action: Action & { __ALLOW_DISPATCH_FROM_ANY: true }) => {
  const options = dispatchFrom(Engine.userId, () => action).to('local')
  return options as Omit<typeof options, 'to'>
}
