import { insertSystems, PresentationSystemGroup } from '../ecs/functions/SystemFunctions'
import { HighlightSystem } from './HighlightSystem'
import { WebGLRendererSystem } from './WebGLRendererSystem'

export const RendererSystems = () => {
  insertSystems([HighlightSystem], 'before', PresentationSystemGroup)
  insertSystems([WebGLRendererSystem], 'with', PresentationSystemGroup)
}
