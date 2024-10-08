import { createEntity, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { defineState, getMutableState } from '@ir-engine/hyperflux'
import { ScriptComponent } from '../../EngineModule'

export const ScriptSystemState = defineState({
  name: 'ee.engine.scene.ScriptSystemState',
  initial: {
    scripts: {} as Record<string, any>
  }
})

// we use the keys to see the number of scripts and
export const ScriptService = {
  addScript: (scriptURL: any) => {
    const state = getMutableState(ScriptSystemState)
    state.scripts[scriptURL] = UndefinedEntity
  },
  removeScript: (scriptURL: any) => {
    const state = getMutableState(ScriptSystemState)
    delete state.scripts[scriptURL]
  },
  activateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptSystemState)
    const scriptEntity = createEntity()
    setComponent(scriptEntity, ScriptComponent, { src: scriptURL })
    state.scripts[scriptURL] = scriptEntity
  },
  deactivateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptSystemState)
    const scriptEntity = state.scripts[scriptURL]
    removeEntity(scriptEntity)
    state.scripts[scriptURL] = UndefinedEntity
  }
}
