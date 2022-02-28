import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

type EditorErrorServiceStateType = {
  error: any
}

const state = createState<EditorErrorServiceStateType>({
  error: null
})

store.receptors.push((action: EditorErrorActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ERROR_THROWN':
        return s.merge({ error: action.error })
    }
  }, action.type)
})

export const accessEditorErrorState = () => state

export const useEditorErrorState = () => useState(state) as any as typeof state

//Service
export const EditorErrorService = {}

//Action
export const EditorErrorAction = {
  throwError: (error: any) => {
    return {
      type: 'ERROR_THROWN' as const,
      error
    }
  }
}

export type EditorErrorActionType = ReturnType<typeof EditorErrorAction[keyof typeof EditorErrorAction]>
