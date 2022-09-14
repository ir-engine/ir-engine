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
  const s = getState(DialogState)
  matches(action)
    .when(DialogAction.dialogShow.matches, (action) => {
      return s.merge({ isOpened: true, content: action.content })
    })
    .when(DialogAction.dialogClose.matches, () => {
      return s.merge({ isOpened: false, content: DialogSeed })
    })
}

export const dialogState = () => getState(DialogState)

export const useDialogState = () => useState(dialogState())

//Action
export class DialogAction {
  static dialogShow = defineAction({
    type: 'xre.client.Dialog.SHOW_DIALOG' as const,
    content: matches.object
  })

  static dialogClose = defineAction({
    type: 'xre.client.Dialog.CLOSE_DIALOG' as const,
    content: matches.any
  })
}
