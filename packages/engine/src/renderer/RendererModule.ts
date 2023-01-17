import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import HighlightSystem from './HighlightSystem'
import WebGLRendererSystem from './WebGLRendererSystem'

export function RendererModule() {
  return [
    {
      uuid: 'xre.engine.HighlightSystem',
      type: SystemUpdateType.PRE_RENDER,
      systemLoader: () => Promise.resolve({ default: HighlightSystem })
    },
    {
      uuid: 'xre.engine.WebGLRendererSystem',
      type: SystemUpdateType.RENDER,
      systemLoader: () => Promise.resolve({ default: WebGLRendererSystem })
    }
  ]
}
