import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'

import { SceneState } from '../functions/sceneRenderFunctions'

export default async function EditorInfoSystem(world: World) {
  return () => {
    if (SceneState.onUpdateStats) {
      Engine.renderer.info.reset()
      const renderStat = Engine.renderer.info.render as any
      renderStat.fps = 1 / world.delta
      renderStat.frameTime = world.delta * 1000
      SceneState.onUpdateStats(Engine.renderer.info)
    }
  }
}
