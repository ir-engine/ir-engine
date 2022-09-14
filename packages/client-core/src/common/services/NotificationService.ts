import { VariantType } from 'notistack'

import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { defaultAction } from '../components/NotificationActions'

const logger = multiLogger.child({ component: 'client-core:Notification' })

export type NotificationOptions = {
  variant: VariantType
  actionType?: keyof typeof NotificationActions
}

export const NotificationActions = {
  default: defaultAction
}

export const NotificationService = {
  dispatchNotify(message: string, options: NotificationOptions) {
    if (options?.variant === 'error') {
      logger.error(new Error(message))
    }
    dispatchAction(NotificationAction.notify({ message, options }))
  }
}

export class NotificationAction {
  static notify = defineAction({
    type: 'xre.client.Notification.ENQUEUE_NOTIFICATION' as const,
    message: matches.string,
    options: matches.object as Validator<unknown, NotificationOptions>
  })
}
