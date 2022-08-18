import { Color, DirectionalLight, Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { VisibleComponent } from '../../../scene/components/VisibleComponent'
import { DirectionalLightComponent, DirectionalLightComponentType } from '../../components/DirectionalLightComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_DIRECTIONAL_LIGHT = 'directional-light'
export const SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff' as unknown as any,
  intensity: 1,
  castShadow: true,
  shadowMapResolution: new Vector2(256, 256),
  shadowBias: 0,
  shadowRadius: 1,
  cameraFar: 100,
  useInCSM: false
} as DirectionalLightComponentType

export const deserializeDirectionalLight: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<DirectionalLightComponentType>
) => {
  const light = new DirectionalLight()
  const props = parseDirectionalLightProperties(json.props)

  light.target.position.set(0, 0, 1)
  light.target.name = 'light-target'
  light.add(light.target)

  EngineRenderer.instance.directionalLightEntities.push(entity)
  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, DirectionalLightComponent, props)

  updateDirectionalLight(entity, props)
}

export const updateDirectionalLight: ComponentUpdateFunction = (
  entity: Entity,
  properties: DirectionalLightComponentType
) => {
  const component = getComponent(entity, DirectionalLightComponent)
  const light = getComponent(entity, Object3DComponent).value as DirectionalLight

  if (typeof properties.color !== 'undefined') light.color.set(component.color)
  if (typeof properties.intensity !== 'undefined') light.intensity = component.intensity
  if (typeof properties.cameraFar !== 'undefined') light.shadow.camera.far = component.cameraFar
  if (typeof properties.shadowBias !== 'undefined') light.shadow.bias = component.shadowBias
  if (typeof properties.shadowRadius !== 'undefined') light.shadow.radius = component.shadowRadius
  if (typeof properties.castShadow !== 'undefined')
    light.castShadow = !EngineRenderer.instance.isCSMEnabled && component.castShadow

  if (typeof properties.shadowMapResolution !== 'undefined') {
    light.shadow.mapSize.copy(component.shadowMapResolution)
    light.shadow.map?.dispose()
    light.shadow.map = null as any

    light.shadow.camera.updateProjectionMatrix()
    light.shadow.needsUpdate = true
  }

  if (typeof properties.useInCSM !== 'undefined') {
    if (component.useInCSM) {
      if (EngineRenderer.instance.activeCSMLightEntity) {
        if (EngineRenderer.instance.activeCSMLightEntity === entity) return

        const activeCSMLight = getComponent(EngineRenderer.instance.activeCSMLightEntity, Object3DComponent)
          ?.value as DirectionalLight
        const activeCSMLightComponent = getComponent(
          EngineRenderer.instance.activeCSMLightEntity,
          DirectionalLightComponent
        )

        activeCSMLight.castShadow = !EngineRenderer.instance.isCSMEnabled && activeCSMLightComponent.castShadow
        activeCSMLightComponent.useInCSM = false

        if (!hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)) {
          addComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent, true)
        }
      }

      if (EngineRenderer.instance.csm) {
        EngineRenderer.instance.csm.changeLights(light)
        light.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
      }

      EngineRenderer.instance.activeCSMLightEntity = entity

      if (hasComponent(entity, VisibleComponent)) removeComponent(entity, VisibleComponent)
    } else {
      light.castShadow = !EngineRenderer.instance.isCSMEnabled && component.castShadow
      component.useInCSM = false

      if (EngineRenderer.instance.activeCSMLightEntity === entity) EngineRenderer.instance.activeCSMLightEntity = null

      if (!hasComponent(entity, VisibleComponent)) {
        addComponent(entity, VisibleComponent, true)
      }
    }
  }
}

export const serializeDirectionalLight: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, DirectionalLightComponent) as DirectionalLightComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_DIRECTIONAL_LIGHT,
    props: {
      color: component.color?.getHex(),
      intensity: component.intensity,
      castShadow: component.castShadow,
      shadowMapResolution: component.shadowMapResolution?.toArray(),
      shadowBias: component.shadowBias,
      shadowRadius: component.shadowRadius,
      cameraFar: component.cameraFar,
      useInCSM: component.useInCSM
    }
  }
}

const parseDirectionalLightProperties = (props): DirectionalLightComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.color),
    intensity: props.intensity ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.intensity,
    castShadow: props.castShadow ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.castShadow,
    shadowBias: props.shadowBias ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.shadowBias,
    shadowRadius: props.shadowRadius ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.shadowRadius,
    shadowMapResolution: props.shadowMapResolution
      ? new Vector2().fromArray(props.shadowMapResolution)
      : new Vector2().copy(SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.shadowMapResolution),
    cameraFar: props.cameraFar ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.cameraFar,
    useInCSM: props.useInCSM ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.useInCSM
  } as DirectionalLightComponentType
}
