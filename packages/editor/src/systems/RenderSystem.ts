import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'

import { SceneState } from '../functions/sceneRenderFunctions'

export default async function EditorInfoSystem() {
  const execute = () => {
    if (SceneState.onUpdateStats) {
      EngineRenderer.instance.renderer.info.reset()
      const renderStat = EngineRenderer.instance.renderer.info.render as any
      renderStat.fps = 1 / Engine.instance.deltaSeconds
      renderStat.frameTime = Engine.instance.deltaSeconds * 1000
      SceneState.onUpdateStats(EngineRenderer.instance.renderer.info)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
