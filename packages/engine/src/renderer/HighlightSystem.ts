import { Object3DComponent } from '../scene/components/Object3DComponent'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'

export default async function HighlightSystem(world: World): Promise<System> {
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
          Engine.effectComposer.OutlineEffect.visibleEdgeColor = compHL.color
          Engine.effectComposer.OutlineEffect.hiddenEdgeColor = compHL.hiddenColor
        }
      })
    }

    for (const entity of highlightsQuery.exit()) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          Engine.effectComposer.OutlineEffect.selection.delete(obj)
        }
      })
    }
  }
}
