import { Object3D } from 'three'

import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../scene/components/GroupComponent'
import { HighlightComponent } from './components/HighlightComponent'
import { EngineRenderer } from './WebGLRendererSystem'

export default async function HighlightSystem() {
  const highlightedObjectQuery = defineQuery([GroupComponent, HighlightComponent])

  const addToSelection = (obj: Object3D) => {
    EngineRenderer.instance.effectComposer.OutlineEffect.selection.add(obj)
  }

  const execute = () => {
    if (!EngineRenderer.instance.effectComposer.OutlineEffect) return

    EngineRenderer.instance.effectComposer.OutlineEffect.selection.clear()

    for (const entity of highlightedObjectQuery()) {
      const group = getComponent(entity, GroupComponent)
      for (const object of group) object.traverse(addToSelection)
    }
  }

  const cleanup = async () => {
    removeQuery(highlightedObjectQuery)
  }

  return { execute, cleanup }
}
