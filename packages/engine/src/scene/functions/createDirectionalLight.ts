import { DirectionalLight, Vector2 } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Entity } from '../../ecs/classes/Entity'
import { ScenePropertyType } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import { addObject3DComponent } from './addObject3DComponent'
import { applyArgsToObject3d } from './applyArgsToObject3d'

export const createDirectionalLight = (
  entity: Entity,
  component: SceneDataComponent,
  sceneProperty: ScenePropertyType
) => {
  if (!isClient) return

  const mapSize = new Vector2().fromArray(component.data.shadowMapResolution)

  const args = {
    'shadow.mapSize': mapSize,
    'shadow.bias': component.data.shadowBias,
    'shadow.radius': component.data.shadowRadius,
    intensity: component.data.intensity,
    color: component.data.color,
    castShadow: component.data.castShadow,
    'shadow.camera.far': component.data.cameraFar
  }

  if (sceneProperty.isCSMEnabled) {
    const object3d = applyArgsToObject3d(entity, new DirectionalLight(), args)
    sceneProperty.directionalLights.push(object3d)
  } else {
    addObject3DComponent(entity, new DirectionalLight(), args)
  }
}
