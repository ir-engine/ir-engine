import { createState, useState, none, Downgraded } from '@hookstate/core'
import { DialogActionType } from './DialogActions'

const state = createState({
  isOpened: false,
  content: undefined
})

export const DialogReducer = (_, action: DialogActionType) => {
  Promise.resolve().then(() => dialogReceptor(action))
  return state.attach(Downgraded).value
}

const dialogReceptor = (action: DialogActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SHOW_DIALOG':
        return s.merge({ isOpened: true, content: action.content })
      case 'CLOSE_DIALOG':
        return s.merge({ isOpened: false, content: undefined })
      default:
        break
    }
  }, action.type)
}

export const dialogState = () => state
export const useDialogState = () => useState(state)
