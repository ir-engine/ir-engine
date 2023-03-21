import { Euler, Texture } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../ecs/functions/EntityFunctions'
import { PortalComponent } from '../components/PortalComponent'

export const enterPortal = async (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const portalDetails = (await Engine.instance.api.service('portal').get(portalComponent.linkedPortalId)).data!
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
 */
export default async function PortalLoadSystem() {
  const portalQuery = defineQuery([PortalComponent])

  const execute = () => {
    for (const entity of portalQuery.enter()) enterPortal(entity)
  }

  const cleanup = async () => {
    removeQuery(portalQuery)
  }

  return { execute, cleanup }
}
