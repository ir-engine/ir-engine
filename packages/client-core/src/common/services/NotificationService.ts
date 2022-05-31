import { createState } from '@speigg/hookstate'
import { OptionsObject, SnackbarMessage, SnackbarProvider, VariantType } from 'notistack'
import { useState } from 'react'

import { store, useDispatch } from '../../store'
import { defaultAction } from '../components/NotificationActions'

export type NotificationOptions = {
  variant: VariantType
  actionType?: keyof typeof NotificationActions
}

export const NotificationActions = {
  default: defaultAction
}

//State
const state = createState({
  enqueueSnackbar: {} as SnackbarProvider
})

store.receptors.push((action: NotificationActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_NOTISTACK':
        return s.merge({
          enqueueSnackbar: action.payload
        })
      case 'ENQUEUE_NOTIFICATION': {
        s.enqueueSnackbar.value.enqueueSnackbar(action.message, {
          variant: action.options.variant,
          action: NotificationActions[action.options.actionType ?? 'default']
        })
      }
    }
  }, action.type)
})

export const accessSettingsState = () => state

export const useSettingsState = () => useState(state) as any as typeof state

export const NotificationService = {
  setNotiStack: async (callback: SnackbarProvider) => {
    const dispatch = useDispatch()
    dispatch(NotificationAction.setNotiStack(callback))
  },
  dispatchNotify(message: string, options: NotificationOptions) {
    const dispatch = useDispatch()
    dispatch(NotificationAction.notify(message, options))
  }
}

export const NotificationAction = {
  setNotiStack: (payload: SnackbarProvider) => {
    return {
      type: 'SET_NOTISTACK' as const,
      payload
    }
  },
  notify: (message: string, options: NotificationOptions) => {
    return {
      type: 'ENQUEUE_NOTIFICATION' as const,
      message,
      options
    }
  }
}

export type NotificationActionType = ReturnType<typeof NotificationAction[keyof typeof NotificationAction]>
