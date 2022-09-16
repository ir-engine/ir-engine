import { Euler, Mesh, MeshBasicMaterial, Texture } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { PortalComponent, PortalPreviewTypeSpherical } from '@xrengine/engine/src/scene/components/PortalComponent'

import { API } from '../API'

export const updatePortalDetails = async (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const portalDetails = (await API.instance.client.service('portal').get(portalComponent.linkedPortalId)).data!
  if (portalDetails) {
    portalComponent.remoteSpawnPosition.copy(portalDetails.spawnPosition)
    portalComponent.remoteSpawnRotation.setFromEuler(new Euler().copy(portalDetails.spawnRotation))
    if (typeof portalComponent.previewImageURL !== 'undefined' && portalComponent.previewImageURL !== '') {
      if (portalComponent.previewType === PortalPreviewTypeSpherical) {
        const texture = (await AssetLoader.loadAsync(portalDetails.previewImageURL)) as Texture
        if (!entityExists(entity)) return
        const portalObject = getComponent(entity, Object3DComponent).value as Mesh<any, MeshBasicMaterial>
        ;(portalObject.children[0] as any).material.map = texture
      }
    }
  }
}

/**
 * Loads portal metadata once the models have been loaded. Depends on API calls.
 * @param world
 */
export default async function PortalLoadSystem(world: World) {
  const portalQuery = defineQuery([PortalComponent, Object3DComponent])
  return () => {
    for (const entity of portalQuery.enter()) updatePortalDetails(entity)
  }
}
