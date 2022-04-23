import { World } from '@xrengine/engine/src/ecs/classes/World'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'

import { SceneState } from '../functions/sceneRenderFunctions'

export default async function EditorInfoSystem(world: World) {
  return () => {
    if (SceneState.onUpdateStats) {
      EngineRenderer.instance.renderer.info.reset()
      const renderStat = EngineRenderer.instance.renderer.info.render as any
      renderStat.fps = 1 / world.delta
      renderStat.frameTime = world.delta * 1000
      SceneState.onUpdateStats(EngineRenderer.instance.renderer.info)
    }
  }
}
