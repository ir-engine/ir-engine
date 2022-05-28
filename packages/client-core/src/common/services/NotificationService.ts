import { VariantType } from 'notistack'

import { useDispatch } from '../../store'
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
    const dispatch = useDispatch()
    dispatch(NotificationAction.notify(message, options))
  }
}

export const NotificationAction = {
  notify: (message: string, options: NotificationOptions) => {
    return {
      type: 'ENQUEUE_NOTIFICATION' as const,
      message,
      options
    }
  }
}

export type NotificationActionType = ReturnType<typeof NotificationAction[keyof typeof NotificationAction]>
