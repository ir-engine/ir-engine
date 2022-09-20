import { World } from '@xrengine/engine/src/ecs/classes/World'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'

import { SceneState } from '../functions/sceneRenderFunctions'

export default async function EditorInfoSystem(world: World) {
  const execute = () => {
    if (SceneState.onUpdateStats) {
      EngineRenderer.instance.renderer.info.reset()
      const renderStat = EngineRenderer.instance.renderer.info.render as any
      renderStat.fps = 1 / world.deltaSeconds
      renderStat.frameTime = world.deltaSeconds * 1000
      SceneState.onUpdateStats(EngineRenderer.instance.renderer.info)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
