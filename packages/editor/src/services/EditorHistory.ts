import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { ComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'
import { Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

export const EditorTopic = 'editor' as Topic

export type EditorStateSnapshot = {
  affectedUUIDs: EntityUUID | string // Entity or Object3D UUID
  component: ComponentType<any>
  state: any
  previousState: any
}

export const EditorActionHistoryState = defineState({
  name: 'EditorActionHistoryState',
  initial: () => ({
    history: [] as EditorStateSnapshot[]
  })
})

export const EditorServiceReceptor = (action) => {}

export const EditorHistoryService = {
}

export class EditorHistoryAction {
  static modifyProperty = defineAction({
    type: 'xre.editor.EditorHistory.MODIFY_PROPERTY' as const,
    properties: matches.object,
    entities: matches.array as Validator<unknown, Entity[]>,
    $topic: EditorTopic
  })
}
