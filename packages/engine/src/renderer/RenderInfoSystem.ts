import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import { EngineState } from '../ecs/classes/EngineState'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { EngineRenderer } from './WebGLRendererSystem'

export const RenderInfoState = defineState({
  name: 'RenderInfoState',
  initial: {
    visible: false,
    info: {
      geometries: 0,
      textures: 0,
      fps: 0,
      frameTime: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    }
  }
})

const execute = () => {
  const state = getState(RenderInfoState)
  if (state.visible) {
    const info = EngineRenderer.instance.renderer.info
    const deltaSeconds = getState(EngineState).deltaSeconds

    const fps = 1 / deltaSeconds
    const frameTime = deltaSeconds * 1000

    getMutableState(RenderInfoState).info.set({
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      fps,
      frameTime,
      calls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines
    })

    info.reset()
  }
}

export const RenderInfoSystem = defineSystem({
  uuid: 'ee.editor.RenderInfoSystem',
  execute
})
