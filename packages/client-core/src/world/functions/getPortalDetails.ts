import { getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { DoubleSide, EquirectangularRefractionMapping, MeshLambertMaterial, TextureLoader } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'

export const getPortalDetails = async (configs) => {
  const token = localStorage.getItem((configs as any).FEATHERS_STORE_KEY)
  const SERVER_URL = (configs as any).SERVER_URL

  const options = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }

  // @TODO make a global ref to all portals instead of getting all components
  await Promise.all(
    World.defaultWorld.portalEntities.map(async (entity: Entity): Promise<void> => {
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
