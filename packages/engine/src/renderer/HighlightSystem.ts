import { Object3DComponent } from '../scene/components/Object3DComponent'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { useEngine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'

export default async function HighlightSystem(world: World): Promise<System> {
  const highlightsQuery = defineQuery([Object3DComponent, HighlightComponent])

  return () => {
    if (!useEngine().effectComposer.OutlineEffect) return

    for (const entity of highlightsQuery.enter()) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      const compHL = getComponent(entity, HighlightComponent)
      if (!compHL) continue
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          useEngine().effectComposer.OutlineEffect.selection.add(obj)
          useEngine().effectComposer.OutlineEffect.visibleEdgeColor = compHL.color
          useEngine().effectComposer.OutlineEffect.hiddenEdgeColor = compHL.hiddenColor
        }
      })
    }

    for (const entity of highlightsQuery.exit()) {
      const highlightedObject = getComponent(entity, Object3DComponent, true)
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          useEngine().effectComposer.OutlineEffect.selection.delete(obj)
        }
      })
    }
  }
}
