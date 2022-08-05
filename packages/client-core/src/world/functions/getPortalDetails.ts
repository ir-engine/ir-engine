import { BackSide, Euler, Mesh, MeshBasicMaterial, SphereGeometry, Texture } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { PortalComponent, PortalPreviewTypeSpherical } from '@xrengine/engine/src/scene/components/PortalComponent'

import { API } from '../../API'

export const updatePortalDetails = async (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const portalDetails = (await API.instance.client.service('portal').get(portalComponent.linkedPortalId)).data!
  if (portalDetails) {
    portalComponent.remoteSpawnPosition.copy(portalDetails.spawnPosition)
    portalComponent.remoteSpawnRotation.setFromEuler(new Euler().copy(portalDetails.spawnRotation))

    if (typeof portalComponent.previewImageURL !== 'undefined' && portalComponent.previewImageURL !== '') {
      if (portalComponent.previewType === PortalPreviewTypeSpherical) {
        const texture = (await AssetLoader.loadAsync(portalDetails.previewImageURL)) as Texture
        const portalMesh = new Mesh(
          new SphereGeometry(1.5, 32, 32),
          new MeshBasicMaterial({ map: texture, side: BackSide })
        )
        portalMesh.scale.x = -1
        const portalObject = getComponent(entity, Object3DComponent)
        portalMesh.scale.x *= 1 / portalObject.value.scale.x
        portalMesh.scale.y *= 1 / portalObject.value.scale.y
        portalMesh.scale.z *= 1 / portalObject.value.scale.z
        portalObject.value.add(portalMesh)
      }
    }
  }
}

export const getPortalDetails = () => {
  Engine.instance.currentWorld.portalQuery().map((entity: Entity) => updatePortalDetails(entity))
}
