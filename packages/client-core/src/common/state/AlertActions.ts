export type AlertType = 'error' | 'success' | 'warning' | 'none'

export const AlertAction = {
  showAlert: (type: AlertType, message: string) => {
    return {
      type: 'SHOW_NOTIFICATION' as const,
      alertType: type,
      message
    }
  },
  hideAlert: () => {
    return {
      type: 'HIDE_NOTIFICATION' as const,
      alertType: 'none',
      message: ''
    }
  }
}

export type AlertActionType = ReturnType<typeof AlertAction[keyof typeof AlertAction]>
