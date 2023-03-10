import { useState } from '@hookstate/core'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState } from '@etherealengine/hyperflux'

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
  const s = getMutableState(EditorErrorState)
  matches(action).when(EditorErrorAction.throwError.matches, (action) => {
    return s.merge({ error: action.error })
  })
}
/**@deprecated use getMutableState directly instead */
export const accessEditorErrorState = () => getMutableState(EditorErrorState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useEditorErrorState = () => useState(accessEditorErrorState())

//Service
export const EditorErrorService = {}

//Action
export class EditorErrorAction {
  static throwError = defineAction({
    type: 'ee.editor.EditorError.ERROR_THROWN' as const,
    error: matches.object as Validator<unknown, Error>
  })
}
