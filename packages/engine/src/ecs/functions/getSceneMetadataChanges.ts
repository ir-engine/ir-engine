import { diffObjectsDeeply } from '@xrengine/common/src/utils/diffObjectsDeeply'
import { NO_PROXY } from '@xrengine/hyperflux'

import { World } from '../classes/World'

export const getSceneMetadataChanges = (world: World) => {
  const keys = Object.keys(world.sceneMetadata)

  const diff = {} as any
  for (const key of keys) {
    const changes = diffObjectsDeeply(world.sceneMetadata[key].default, world.sceneMetadata[key].state.get(NO_PROXY))
    if (Object.keys(changes).length) diff[key] = changes
  }

  return diff
}
