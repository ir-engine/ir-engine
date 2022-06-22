import { DialogSeed } from '@xrengine/common/src/interfaces/Dialog'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

//State
const DialogState = defineState({
  name: 'DialogState',
  initial: () => ({
    isOpened: false,
    content: DialogSeed
  })
})

export const DialogServiceReceptor = (action) => {
  getState(DialogState).batch((s) => {
    matches(action)
      .when(DialogAction.dialogShow.matches, (action) => {
        return s.merge({ isOpened: true, content: action.content })
      })
      .when(DialogAction.dialogClose.matches, () => {
        return s.merge({ isOpened: false, content: DialogSeed })
      })
  })
}

export const dialogState = () => getState(DialogState)

export const useDialogState = () => useState(dialogState())

//Action
export class DialogAction {
  static dialogShow = defineAction({
    type: 'SHOW_DIALOG' as const,
    content: matches.object
  })

  static dialogClose = defineAction({
    type: 'CLOSE_DIALOG' as const,
    content: matches.any
  })
}
