import { defineQuery, defineSystem, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { UIRootComponent } from '../components/UIRootComponent'

export const UISystem = async (): Promise<System> => {
  const uiQuery = defineQuery([UIRootComponent])

  return defineSystem((world: ECSWorld) => {
    const interactionRays = []

    for (const entity of uiQuery(world)) {
      const layer = getComponent(entity, UIRootComponent).layer
      layer.interactionRays = interactionRays
      layer.update()
    }

    return world
  })
}
