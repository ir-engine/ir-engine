/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { createEntity, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { ScriptComponent } from '@ir-engine/engine'
import { defineState, getMutableState } from '@ir-engine/hyperflux'

export const ScriptState = defineState({
  name: 'ee.engine.scene.ScriptSystemState',
  initial: () => {
    // filter out the js files from the file browser
    const scripts: Record<string, any> = {}
    scripts['https://localhost:8642/projects/ir-engine/default-project/assets/scripts/dayNightCycleScript.js'] =
      UndefinedEntity
    scripts['https://localhost:8642/projects/ir-engine/default-project/assets/scripts/proceduralGenerationScript.js'] =
      UndefinedEntity
    scripts['https://localhost:8642/projects/ir-engine/default-project/assets/scripts/defaultObjectRotateScript.js'] =
      UndefinedEntity
    return { scripts: scripts }
  }
})
// we use the keys to see the number of scripts and
export const ScriptService = {
  addScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    state.scripts.set({ ...state.scripts.value, [scriptURL]: UndefinedEntity })
  },
  removeScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const { [scriptURL]: _, ...newScripts } = state.scripts.value
    state.scripts.set(newScripts)
  },
  activateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const scriptEntity = createEntity()
    setComponent(scriptEntity, ScriptComponent, { src: scriptURL })
    state.scripts.set({ ...state.scripts.value, [scriptURL]: scriptEntity })
  },
  deactivateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const scriptEntity = state.scripts[scriptURL]
    if (scriptEntity !== UndefinedEntity) {
      removeEntity(scriptEntity)
      state.scripts.set({ ...state.scripts.value, [scriptURL]: UndefinedEntity })
    }
  }
}
