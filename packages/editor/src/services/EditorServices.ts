/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState } from '@etherealengine/hyperflux'

export const EditorState = defineState({
  name: 'EditorState',
  initial: () => ({
    projectName: null as string | null,
    sceneName: null as string | null,
    sceneModified: false,
    showObject3DInHierarchy: false,
    lockPropertiesPanel: '' as EntityUUID,
    advancedMode: false
  })
})

export const EditorServiceReceptor = (action) => {
  const s = getMutableState(EditorState)
  matches(action)
    .when(EditorAction.sceneChanged.matches, (action) => {
      return s.merge({ sceneName: action.sceneName, sceneModified: false })
    })
    .when(EditorAction.projectChanged.matches, (action) => {
      return s.merge({ projectName: action.projectName, sceneName: null, sceneModified: false })
    })
    .when(EditorAction.showObject3DInHierarchy.matches, (action) => {
      return s.merge({ showObject3DInHierarchy: action.showObject3DInHierarchy })
    })
    .when(EditorAction.lockPropertiesPanel.matches, (action) =>
      s.merge({ lockPropertiesPanel: action.lockPropertiesPanel })
    )
    .when(EditorAction.setAdvancedMode.matches, (action) => {
      return s.merge({ advancedMode: action.advanced })
    })
}

//Service
export const EditorService = {}

//Action
export class EditorAction {
  static projectChanged = defineAction({
    type: 'ee.editor.Editor.EDITOR_PROJECT_CHANGED' as const,
    projectName: matches.any as Validator<unknown, string | null>
  })

  static sceneChanged = defineAction({
    type: 'ee.editor.Editor.EDITOR_SCENE_CHANGED' as const,
    sceneName: matches.any as Validator<unknown, string | null>
  })

  static showObject3DInHierarchy = defineAction({
    type: 'ee.editor.Editor.SHOW_OBJECT3D_IN_HIERARCHY' as const,
    showObject3DInHierarchy: matches.boolean
  })

  static setAdvancedMode = defineAction({
    type: 'ee.editor.Editor.SET_ADVANCED_MODE' as const,
    advanced: matches.boolean
  })

  static lockPropertiesPanel = defineAction({
    type: 'ee.editor.Editor.LOCK_PROPERTIES_PANEL' as const,
    lockPropertiesPanel: matches.string as Validator<unknown, EntityUUID>
  })
}
