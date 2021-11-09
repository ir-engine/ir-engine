import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'
import { SceneDetailInterface, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'

export const sceneRelativePathIdentifier = '__$project$__'

export const parseSceneDataCacheURLs = (sceneData: SceneJson, cacheDomain: string) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = parseSceneDataCacheURLs(val, cacheDomain)
    }
    if (typeof val === 'string' && val.includes(sceneRelativePathIdentifier)) {
      sceneData[key] = getCachedAsset(val.replace(sceneRelativePathIdentifier, '/projects'), cacheDomain)
    }
  }
  return sceneData
}

export const cleanSceneDataCacheURLs = (sceneData: SceneJson, cacheDomain: string) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = cleanSceneDataCacheURLs(val, cacheDomain)
    }
    if (typeof val === 'string' && val.includes('https://' + cacheDomain + '/projects')) {
      sceneData[key] = val.replace('https://' + cacheDomain + '/projects', sceneRelativePathIdentifier)
    }
  }
  return sceneData
}

export const parseScenePortals = (scene: SceneDetailInterface) => {
  const portals: PortalDetail[] = []
  for (const [entityId, entity] of Object.entries(scene.scene.entities)) {
    for (const component of entity.components)
      if (component.name === 'portal') {
        portals.push({
          sceneName: scene.name,
          portalEntityId: entityId,
          spawnPosition: component.props.spawnPosition,
          spawnRotation: component.props.spawnRotation
        })
      }
  }
  return portals
}
