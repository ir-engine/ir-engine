import { diff } from 'deep-object-diff'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { Scene } from '../classes/Scene'

export const getSceneMetadataChanges = (scene: Scene) => {
  const keys = Object.keys(scene.sceneMetadataRegistry)
  const difference = {} as any

  for (const key of keys) {
    const changes = diff(scene.sceneMetadataRegistry[key].default, scene.sceneMetadataRegistry[key].state.get(NO_PROXY))
    if (Object.keys(changes).length) difference[key] = changes
  }

  return difference
}

globalThis.getSceneMetadataChanges = getSceneMetadataChanges
