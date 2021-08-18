import { getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { findProjectionScreen, setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
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
      return fetch(`${SERVER_URL}/portal/${portal.linkedPortalId}`, options)
        .then((res) => {
          try {
            return res.json()
          } catch (e) {}
        })
        .then((res) => {
          if (res) {
            setRemoteLocationDetail(portal, res.data.spawnPosition, res.data.spawnRotation)
            fetch(`${SERVER_URL}/relectionProebe/${res.data.reflectionProbeId}`, options)
              .then((res) => {
                try {
                  return res.json()
                } catch (e) {}
              })
              .then((res) => {
                try {
                  if (res) {
                    const textureLoader = new TextureLoader()
                    const texture = textureLoader.load(res.data.options.envMapOrigin)
                    texture.mapping = EquirectangularRefractionMapping

                    const portalMaterial = new MeshLambertMaterial({ envMap: texture, side: DoubleSide })

                    const screen = findProjectionScreen(entity)
                    screen.material = portalMaterial

                    texture.dispose()
                  }
                } catch (e) {}
              })
          }
        })
    })
  )
}
