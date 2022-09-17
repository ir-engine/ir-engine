import { useState } from '@hookstate/core'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'

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
  const s = getState(EditorErrorState)
  matches(action).when(EditorErrorAction.throwError.matches, (action) => {
    return s.merge({ error: action.error })
  })
}

export const accessEditorErrorState = () => getState(EditorErrorState)

export const useEditorErrorState = () => useState(accessEditorErrorState())

//Service
export const EditorErrorService = {}

//Action
export class EditorErrorAction {
  static throwError = defineAction({
    type: 'xre.editor.EditorError.ERROR_THROWN' as const,
    error: matches.object as Validator<unknown, Error>
  })
}
