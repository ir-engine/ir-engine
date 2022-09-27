import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'
import { Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

export const EditorTopic = 'editor' as Topic

export const EditorActionHistoryState = defineState({
  name: 'EditorActionHistoryState',
  initial: () => ({
    history: []
  })
})

export const EditorServiceReceptor = (action) => {}

export const EditorHistoryService = {
}

export class EditorAction {
  static modifyProperty = defineAction({
    type: 'xre.editor.EditorHistory.MODIFY_PROPERTY' as const,
    properties: matches.object,
    entities: matches.array as Validator<unknown, Entity[]>,
    $topic: EditorTopic
  })
}
