import { diff } from 'deep-object-diff'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { World } from '../classes/World'

export const getSceneMetadataChanges = (world: World) => {
  const keys = Object.keys(world.sceneMetadataRegistry)
  const difference = {} as any

  for (const key of keys) {
    const changes = diff(world.sceneMetadataRegistry[key].default, world.sceneMetadataRegistry[key].state.get(NO_PROXY))
    if (Object.keys(changes).length) difference[key] = changes
  }

  return difference
}

globalThis.getSceneMetadataChanges = getSceneMetadataChanges
