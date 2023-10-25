import { defineState, getMutableState } from '@etherealengine/hyperflux'

export const DialogState = defineState({
  name: 'DialogState',
  initial: () => ({
    dialog: null as JSX.Element | null
  }),

  setDialog: (dialog: JSX.Element | null) => {
    getMutableState(DialogState).dialog.set(dialog)
  }
})
