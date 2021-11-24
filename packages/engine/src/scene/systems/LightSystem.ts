import { DirectionalLight } from 'three'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { Object3DComponent } from '../components/Object3DComponent'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function LightSystem(world: World): Promise<System> {
  const directionalLightQuery = defineQuery([DirectionalLightComponent])

  return () => {
    for (const entity of directionalLightQuery()) {
      const component = getComponent(entity, DirectionalLightComponent)

      if (!component.dirty) return
      const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight

      light.color.set(component.color)
      light.intensity = component.intensity
      light.shadow.camera.far = component.cameraFar
      light.shadow.bias = component.shadowBias
      light.shadow.radius = component.shadowRadius
      light.castShadow = component.castShadow

      light.shadow.mapSize.copy(component.shadowMapResolution)
      light.shadow.map?.dispose()
      light.shadow.map = null as any

      light.shadow.camera.updateProjectionMatrix()

      // showHelper
      ;(light as any).cameraHelper.visible = component.showCameraHelper

      ;(light as any).helper.update()
      ;(light as any).cameraHelper.update()
      component.dirty = false
    }
  }
}
