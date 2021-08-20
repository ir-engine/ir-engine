import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { HighlightComponent } from './components/HighlightComponent'
import { Engine } from '../ecs/classes/Engine'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../ecs/bitecs'
import { ECSWorld } from '../ecs/classes/World'

export const HighlightSystem = async (): Promise<System> => {
  const highlightsQuery = defineQuery([Object3DComponent, HighlightComponent])
  const highlightsAddQuery = enterQuery(highlightsQuery)
  const highlightsRemoveQuery = exitQuery(highlightsQuery)

  return defineSystem((world: ECSWorld) => {
    if (!Engine.effectComposer.OutlineEffect) return

    for (const entity of highlightsAddQuery(world)) {
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

    for (const entity of highlightsRemoveQuery(world)) {
      const highlightedObject = getComponent(entity, Object3DComponent, true)
      highlightedObject?.value?.traverse((obj) => {
        if (obj !== undefined) {
          Engine.effectComposer.OutlineEffect.selection.delete(obj)
        }
      })
    }

    return world
  })
}
