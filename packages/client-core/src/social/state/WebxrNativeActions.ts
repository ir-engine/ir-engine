/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

export const WebxrNativeAction = {
  setWebXrNative: () => {
    return {
      type: 'SET_WEBXRNATIVE' as const
    }
  },
  tougleWebXrNative: () => {
    return {
      type: 'TOGGLE_WEBXRNATIVE' as const
    }
  }
}

export type WebxrNativeActionType = ReturnType<typeof WebxrNativeAction[keyof typeof WebxrNativeAction]>
