import { Euler, Texture } from 'three'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { PortalComponent } from '@etherealengine/engine/src/scene/components/PortalComponent'

import { API } from '../API'

export const enterPortal = async (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const portalDetails = (await API.instance.client.service('portal').get(portalComponent.linkedPortalId)).data!
  if (portalDetails) {
    portalComponent.remoteSpawnPosition.copy(portalDetails.spawnPosition)
    portalComponent.remoteSpawnRotation.setFromEuler(
      new Euler(
        portalDetails.spawnRotation.x,
        portalDetails.spawnRotation.y,
        portalDetails.spawnRotation.z,
        portalDetails.spawnRotation.order
      )
    )
    if (typeof portalComponent.previewImageURL !== 'undefined' && portalComponent.previewImageURL !== '') {
      if (portalComponent.mesh) {
        const texture = (await AssetLoader.loadAsync(portalDetails.previewImageURL)) as Texture
        if (!entityExists(entity)) return
        portalComponent.mesh.material.map = texture
      }
    }
  }
}

/**
 * Loads portal metadata once the models have been loaded. Depends on API calls.
 * @param world
 */
export default async function PortalLoadSystem(world: World) {
  const portalQuery = defineQuery([PortalComponent])

  const execute = () => {
    for (const entity of portalQuery.enter()) enterPortal(entity)
  }

  const cleanup = async () => {
    removeQuery(world, portalQuery)
  }

  return { execute, cleanup }
}
