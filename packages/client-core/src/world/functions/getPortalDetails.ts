import { getAllMutableComponentOfType } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { findProjectionScreen, setRemoteLocationDetail } from '@xrengine/engine/src/scene/behaviors/createPortal'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { DoubleSide, EquirectangularRefractionMapping, MeshLambertMaterial, TextureLoader } from 'three'

export const getPortalDetails = async (configs) => {
  const token = localStorage.getItem((configs as any).FEATHERS_STORE_KEY)
  const SERVER_URL = (configs as any).SERVER_URL

  const options = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }

  const portals = getAllMutableComponentOfType(PortalComponent)

  await Promise.all(
    portals.map(async (portal: PortalComponent): Promise<void> => {
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

                    const screen = findProjectionScreen(portal.entity)
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
