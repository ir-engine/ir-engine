import { Object3DComponent } from '../scene/components/Object3DComponent'
import { defineQuery, getAllComponentsOfType, getComponent } from '../ecs/functions/ComponentFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'
import { PostProcessingComponent } from '../scene/components/PostProcessingComponent'
import { Effects } from '../scene/classes/PostProcessing'

export default async function HighlightSystem(world: World): Promise<System> {
  const highlightsQuery = defineQuery([Object3DComponent, HighlightComponent])

  return () => {
    if (!Engine.effectComposer.OutlineEffect) return

    const components = getAllComponentsOfType(PostProcessingComponent)

    for (const entity of highlightsQuery.enter()) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      const compHL = getComponent(entity, HighlightComponent)
      if (!compHL) continue

      const outlineEffect = components[0][Effects.OutlineEffect].effect
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          outlineEffect.selection.add(obj)
          outlineEffect.visibleEdgeColor = compHL.color
          outlineEffect.hiddenEdgeColor = compHL.hiddenColor
        }
      })
    }

    for (const entity of highlightsQuery.exit()) {
      const highlightedObject = getComponent(entity, Object3DComponent)
      const outlineEffect = components[0][Effects.OutlineEffect].effect

      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          outlineEffect.selection.delete(obj)
        }
      })
    }
  }
}
