import { VariantType } from 'notistack'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { defaultAction } from '../components/NotificationActions'

export type NotificationOptions = {
  variant: VariantType
  actionType?: keyof typeof NotificationActions
}

export const NotificationActions = {
  default: defaultAction
}

export const NotificationService = {
  dispatchNotify(message: string, options: NotificationOptions) {
    dispatchAction(NotificationAction.notify({ message, options }))
  }
}

export class NotificationAction {
  static notify = defineAction({
    type: 'ENQUEUE_NOTIFICATION' as const,
    message: matches.string,
    options: matches.object as Validator<unknown, NotificationOptions>
  })
}
