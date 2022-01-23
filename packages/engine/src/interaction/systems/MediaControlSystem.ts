import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { World } from '../../ecs/classes/World'
import { createMediaControlsUI, removeMediaControlsUI } from '../functions/mediaControlsUI'
import { MediaComponent } from '../../scene/components/MediaComponent'

export default async function MediaControlSystem(world: World) {
  const mediaQuery = defineQuery([MediaComponent])

  return () => {
    for (const entity of mediaQuery.enter(world)) {
      createMediaControlsUI(entity)
    }

    for (const entity of mediaQuery.exit(world)) {
      removeMediaControlsUI(entity)
    }
  }
}
