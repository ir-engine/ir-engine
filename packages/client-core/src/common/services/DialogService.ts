import { createState, useState } from '@speigg/hookstate'
import { DialogSeed } from '@xrengine/common/src/interfaces/Dialog'
import { store } from '../../store'
import { Dialog } from '@xrengine/common/src/interfaces/Dialog'

//State
const state = createState({
  isOpened: false,
  content: DialogSeed
})

store.receptors.push((action: DialogActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SHOW_DIALOG':
        return s.merge({ isOpened: true, content: action.content })
      case 'CLOSE_DIALOG':
        return s.merge({ isOpened: false, content: DialogSeed })
      default:
        break
    }
  }, action.type)
})

export const dialogState = () => state

export const useDialogState = () => useState(state) as any as typeof state

//Action
export const DialogAction = {
  dialogShow: (content: Dialog) => {
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
