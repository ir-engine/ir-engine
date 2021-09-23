export const DialogAction = {
  dialogShow: (content: any) => {
    return {
      type: 'SHOW_DIALOG' as const,
      content
    }
  },
  dialogClose: () => {
    return {
      type: 'CLOSE_DIALOG' as const,
      content: undefined
    }
  }
}

export type DialogActionType = ReturnType<typeof DialogAction[keyof typeof DialogAction]>
