import { Object3D } from 'three'

import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { HighlightComponent } from './components/HighlightComponent'
import { EngineRenderer } from './WebGLRendererSystem'

export default async function HighlightSystem() {
  const highlightedObjectQuery = defineQuery([Object3DComponent, HighlightComponent])

  const addToSelection = (obj: Object3D) => {
    EngineRenderer.instance.effectComposer.OutlineEffect.selection.add(obj)
  }

  return () => {
    if (!EngineRenderer.instance.effectComposer.OutlineEffect) return

    EngineRenderer.instance.effectComposer.OutlineEffect.selection.clear()

    for (const entity of highlightedObjectQuery()) {
      const highlightedObject = getComponent(entity, Object3DComponent).value
      highlightedObject?.traverse(addToSelection)
    }
  }
}
