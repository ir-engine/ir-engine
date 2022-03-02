import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { HighlightComponent } from './components/HighlightComponent'

export default async function HighlightSystem(world: World) {
  const highlightsQuery = defineQuery([Object3DComponent, HighlightComponent])

  return () => {
    if (!Engine.effectComposer.OutlineEffect) return

    for (const entity of highlightsQuery.enter()) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      const compHL = getComponent(entity, HighlightComponent)
      if (!compHL) continue
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          Engine.effectComposer.OutlineEffect.selection.add(obj)
        }
      })
    }

    for (const entity of highlightsQuery.exit()) {
      const highlightedObject = getComponent(entity, Object3DComponent, true)
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          Engine.effectComposer.OutlineEffect.selection.delete(obj)
        }
      })
    }
  }
}
