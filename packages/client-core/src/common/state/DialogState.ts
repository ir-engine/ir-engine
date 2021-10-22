import { createState, DevTools, useState, Downgraded } from '@hookstate/core'
import { DialogActionType } from './DialogActions'
import { DialogSeed } from '@xrengine/common/src/interfaces/Dialog'
import { store } from '../../store'

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
