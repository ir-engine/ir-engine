import { Object3D } from 'three'

import { Engine } from '../ecs/classes/Engine'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { HighlightComponent } from './components/HighlightComponent'

export default async function HighlightSystem() {
  const highlightedObjectQuery = defineQuery([Object3DComponent, HighlightComponent])

  const addToSelection = (obj: Object3D) => {
    Engine.effectComposer.OutlineEffect.selection.add(obj)
  }

  return () => {
    if (!Engine.effectComposer.OutlineEffect) return

    Engine.effectComposer.OutlineEffect.selection.clear()

    for (const entity of highlightedObjectQuery()) {
      const highlightedObject = getComponent(entity, Object3DComponent).value
      highlightedObject?.traverse(addToSelection)
    }
  }
}
