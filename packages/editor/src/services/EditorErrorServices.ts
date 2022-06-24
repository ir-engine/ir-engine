import { useState } from '@speigg/hookstate'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { addActionReceptor, defineAction, defineState, getState, registerState } from '@xrengine/hyperflux'

type EditorErrorServiceStateType = {
  error: any
}

const EditorErrorState = defineState({
  name: 'EditorErrorState',
  initial: () =>
    ({
      error: null
    } as EditorErrorServiceStateType)
})

export const EditorErrorServiceReceptor = (action): any => {
  getState(EditorErrorState).batch((s) => {
    matches(action).when(EditorErrorAction.throwError.matches, (action) => {
      return s.merge({ error: action.error })
    })
  })
}

export const accessEditorErrorState = () => getState(EditorErrorState)

export const useEditorErrorState = () => useState(accessEditorErrorState())

//Service
export const EditorErrorService = {}

//Action
export class EditorErrorAction {
  static throwError = defineAction({
    type: 'editorError.ERROR_THROWN' as const,
    error: matches.object as Validator<unknown, Error>
  })
}
