import { diffObjectsDeeply } from '@xrengine/common/src/utils/diffObjectsDeeply'
import { NO_PROXY } from '@xrengine/hyperflux'

import { World } from '../classes/World'

export const getSceneMetadataChanges = (world: World) => {
  const keys = Object.keys(world.sceneMetadataRegistry)

  const diff = {} as any
  for (const key of keys) {
    const changes = diffObjectsDeeply(
      world.sceneMetadataRegistry[key].default,
      world.sceneMetadataRegistry[key].state.get(NO_PROXY)
    )
    if (Object.keys(changes).length) diff[key] = changes
  }

  return diff
}
