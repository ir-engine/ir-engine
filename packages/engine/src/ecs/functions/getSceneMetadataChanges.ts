import { diff } from 'deep-object-diff'

import { getState } from '@etherealengine/hyperflux'

import { SceneState } from '../classes/Scene'

export const getSceneMetadataChanges = () => {
  const scene = getState(SceneState)
  const keys = Object.keys(scene.sceneMetadataRegistry)
  const difference = {} as any

  for (const key of keys) {
    const changes = diff(scene.sceneMetadataRegistry[key].default, scene.sceneMetadataRegistry[key].data)
    if (Object.keys(changes).length) difference[key] = changes
  }

  return difference
}

globalThis.getSceneMetadataChanges = getSceneMetadataChanges
