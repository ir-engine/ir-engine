import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { client } from '../../feathers'

export const getPortalDetails = () => {
  Engine.currentWorld.portalQuery().map(async (entity: Entity): Promise<void> => {
    const portalComponent = getComponent(entity, PortalComponent)
    try {
      const portalDetails = await client.service('portal').get(portalComponent.linkedPortalId)
      if (portalDetails) {
        setRemoteLocationDetail(portalComponent, portalDetails.data.spawnPosition, portalDetails.data.spawnRotation)
        // const cubemapBakeDetails = await (
        //   await fetch(`${SERVER_URL}/cubemap/${portalDetails.data.cubemapBakeId}`, options)
        // ).json()
        // // console.log('cubemapBakeDetails', cubemapBakeDetails)
        // if (cubemapBakeDetails) {
        //   const textureLoader = new TextureLoader()
        //   const texture = textureLoader.load(cubemapBakeDetails.data.options.envMapOrigin)
        //   texture.mapping = EquirectangularRefractionMapping

        //   const portalMaterial = new MeshLambertMaterial({ envMap: texture, side: DoubleSide })

        //   portal.previewMesh.material = portalMaterial

        //   // texture.dispose()
        // }
      }
    } catch (e) {
      console.log(e)
    }
  })
}
