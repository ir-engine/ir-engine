import { createEntity, Entity, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { ScriptComponent } from '@ir-engine/engine'
import { defineState, getMutableState } from '@ir-engine/hyperflux'

export const ScriptState = defineState({
  name: 'ee.engine.scene.ScriptState',
  initial: () => {
    return {} as Record<string, Entity>
  }
})
// we use the keys to see the number of scripts and
export const ScriptService = {
  addScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    state.scripts[scriptURL] = UndefinedEntity
  },
  removeScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    delete state.scripts[scriptURL]
  },
  activateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const scriptEntity = createEntity()
    setComponent(scriptEntity, ScriptComponent, { src: scriptURL })
    state.scripts[scriptURL] = scriptEntity
  },
  deactivateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const scriptEntity = state.scripts[scriptURL]
    removeEntity(scriptEntity)
    state.scripts[scriptURL] = UndefinedEntity
  }
}
