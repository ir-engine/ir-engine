import { DialogSeed } from '@etherealengine/common/src/interfaces/Dialog'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

//State
const DialogState = defineState({
  name: 'DialogState',
  initial: () => ({
    isOpened: false,
    content: DialogSeed
  })
})

export const DialogServiceReceptor = (action) => {
  const s = getMutableState(DialogState)
  matches(action)
    .when(DialogAction.dialogShow.matches, (action) => {
      return s.merge({ isOpened: true, content: action.content })
    })
    .when(DialogAction.dialogClose.matches, () => {
      return s.merge({ isOpened: false, content: DialogSeed })
    })
}
/**@deprecated use getMutableState directly instead */
export const dialogState = () => getMutableState(DialogState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useDialogState = () => useState(dialogState())

//Action
export class DialogAction {
  static dialogShow = defineAction({
    type: 'ee.client.Dialog.SHOW_DIALOG' as const,
    content: matches.object
  })

  static dialogClose = defineAction({
    type: 'ee.client.Dialog.CLOSE_DIALOG' as const,
    content: matches.any
  })
}
