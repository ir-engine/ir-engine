import { PerspectiveCamera, DirectionalLight, PCFSoftShadowMap, LinearToneMapping } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { CSM } from '../../assets/csm/CSM'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { RenderSettingComponent } from '../components/RenderSettingComponent'

export const resetEngineRenderer = (resetLODs = false) => {
  if (!isClient) return

  Engine.renderer.shadowMap.enabled = true
  Engine.renderer.shadowMap.type = PCFSoftShadowMap
  Engine.renderer.shadowMap.needsUpdate = true

  Engine.renderer.toneMapping = LinearToneMapping
  Engine.renderer.toneMappingExposure = 0.8

  if (resetLODs) AssetLoader.LOD_DISTANCES = Object.assign({}, DEFAULT_LOD_DISTANCES)

  if (!Engine.csm) return

  Engine.csm.remove()
  Engine.csm.dispose()
  Engine.csm = undefined!

  Engine.scene.traverse((o: DirectionalLight) => {
    if (o.isDirectionalLight) {
      o.visible = o.userData.prevVisible ?? false
      delete o.userData.prevVisible
    }
  })
}

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function RenderSettingSystem(_: World): Promise<System> {
  const renderSettingQuery = defineQuery([RenderSettingComponent])

  return () => {
    for (const entity of renderSettingQuery()) {
      const component = getComponent(entity, RenderSettingComponent)

      if (!component.dirty) continue

      if (component.LODs)
        AssetLoader.LOD_DISTANCES = { '0': component.LODs.x, '1': component.LODs.y, '2': component.LODs.y }

      if (component.overrideRendererSettings) {
        resetEngineRenderer()
        continue
      }

      Engine.renderer.toneMapping = component.toneMapping
      Engine.renderer.toneMappingExposure = component.toneMappingExposure

      if (component.shadowMapType) {
        Engine.renderer.shadowMap.enabled = true
        Engine.renderer.shadowMap.needsUpdate = true
        Engine.renderer.shadowMap.type = component.shadowMapType
      } else {
        Engine.renderer.shadowMap.enabled = false
      }

      if (component.csm && !Engine.csm && !Engine.isHMD && Engine.renderer.shadowMap.enabled) {
        const directionalLights = [] as DirectionalLight[]
        Engine.scene.traverseVisible((o: DirectionalLight) => {
          if (o.isDirectionalLight) directionalLights.push(o)
        })

        if (directionalLights.length > 0) {
          // This can not be done while traversing since traverse visible will skip traversing decendents of the not visible objects
          directionalLights.forEach((d) => {
            d.userData.prevVisile = d.visible
            d.visible = false
          })

          Engine.csm = new CSM({
            camera: Engine.camera as PerspectiveCamera,
            parent: Engine.scene,
            lights: directionalLights
          })
        }
      }

      component.dirty = false
    }

    for (const _ of renderSettingQuery.exit()) {
      resetEngineRenderer()
    }
  }
}
