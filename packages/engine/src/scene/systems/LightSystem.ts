import { DirectionalLight, HemisphereLight } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { SelectTagComponent } from '../components/SelectTagComponent'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function LightSystem(_: World): Promise<System> {
  const directionalLightQuery = defineQuery([DirectionalLightComponent])
  const hemisphereLightQuery = defineQuery([HemisphereLightComponent])
  const directionalLightSelectQuery = defineQuery([DirectionalLightComponent, SelectTagComponent])

  return () => {
    for (const entity of directionalLightQuery()) {
      const component = getComponent(entity, DirectionalLightComponent)

      if (!component.dirty) continue
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
      light.shadow.needsUpdate = true

      if (Engine.isEditor) {
        ;(light as any).helper.update()
        ;(light as any).cameraHelper.visible = component.showCameraHelper
        ;(light as any).cameraHelper.update()
      }

      component.dirty = false
    }

    if (Engine.isEditor) {
      for (const entity of directionalLightSelectQuery.enter()) {
        const component = getComponent(entity, DirectionalLightComponent)
        const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
        ;(light as any).cameraHelper.visible = component.showCameraHelper
      }

      for (const entity of directionalLightSelectQuery.exit()) {
        const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
        ;(light as any).cameraHelper.visible = false
      }
    }

    for (const entity of hemisphereLightQuery()) {
      const component = getComponent(entity, HemisphereLightComponent)

      if (!component.dirty) continue
      const light = getComponent(entity, Object3DComponent)?.value as HemisphereLight

      light.groundColor = component.groundColor
      light.color = component.skyColor
      light.intensity = component.intensity
    }
  }
}
