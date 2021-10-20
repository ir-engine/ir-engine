import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { DoubleSide, EquirectangularRefractionMapping, MeshLambertMaterial, TextureLoader } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Config } from '@xrengine/common/src/config'

export const getPortalDetails = async () => {
  const token = localStorage.getItem(Config.publicRuntimeConfig.feathersStoreKey)
  const SERVER_URL = Config.publicRuntimeConfig.apiServer

  const options = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }

  // @TODO make a global ref to all portals instead of getting all components
  await Promise.all(
    Engine.defaultWorld.portalEntities.map(async (entity: Entity): Promise<void> => {
      const portal = getComponent(entity, PortalComponent)
      try {
        const portalDetails = await (await fetch(`${SERVER_URL}/portal/${portal.linkedPortalId}`, options)).json()
        // console.log('portalDetails', portalDetails)
        if (portalDetails) {
          setRemoteLocationDetail(portal, portalDetails.data.spawnPosition, portalDetails.data.spawnRotation)
          const cubemapBakeDetails = await (
            await fetch(`${SERVER_URL}/cubemap/${portalDetails.data.cubemapBakeId}`, options)
          ).json()
          // console.log('cubemapBakeDetails', cubemapBakeDetails)
          if (cubemapBakeDetails) {
            const textureLoader = new TextureLoader()
            const texture = textureLoader.load(cubemapBakeDetails.data.options.envMapOrigin)
            texture.mapping = EquirectangularRefractionMapping

            const portalMaterial = new MeshLambertMaterial({ envMap: texture, side: DoubleSide })

            portal.previewMesh.material = portalMaterial

            // texture.dispose()
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
  )
}
