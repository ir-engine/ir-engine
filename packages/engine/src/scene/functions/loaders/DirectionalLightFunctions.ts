import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { CameraHelper, DirectionalLight, Vector2, Color } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import EditorDirectionalLightHelper from '../../classes/EditorDirectionalLightHelper'
import { DirectionalLightComponent, DirectionalLightComponentType } from '../../components/DirectionalLightComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_DIRECTIONAL_LIGHT = 'directional-light'
export const SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff',
  intensity: 1,
  castShadow: true,
  shadowMapResolution: [256, 256],
  shadowBias: 0.5,
  shadowRadius: 1,
  cameraFar: 100,
  showCameraHelper: false
}

export const deserializeDirectionalLight: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<DirectionalLightComponentType>
) => {
  const light = new DirectionalLight()
  const props = parseDirectionalLightProperties(json.props)
  props.light = light

  light.target.position.set(0, 0, 1)
  light.target.name = 'light-target'
  light.add(light.target)

  if (Engine.isEditor) {
    const helper = new EditorDirectionalLightHelper()
    helper.visible = true
    light.add(helper)
    light.userData.helper = helper

    const cameraHelper = new CameraHelper(light.shadow.camera)
    cameraHelper.visible = false
    light.userData.cameraHelper = cameraHelper
  }

  if (Engine.isCSMEnabled) {
    Engine.directionalLights.push(light)
  } else {
    addComponent(entity, Object3DComponent, { value: light })
  }

  addComponent(entity, DirectionalLightComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_DIRECTIONAL_LIGHT)

  updateDirectionalLight(entity, props)
}

export const updateDirectionalLight: ComponentUpdateFunction = (
  entity: Entity,
  properties: DirectionalLightComponentType
) => {
  const component = getComponent(entity, DirectionalLightComponent)
  const light = component.light

  if (Object.hasOwnProperty.call(properties, 'color')) light.color.set(component.color)
  if (Object.hasOwnProperty.call(properties, 'intensity')) light.intensity = component.intensity
  if (Object.hasOwnProperty.call(properties, 'cameraFar')) light.shadow.camera.far = component.cameraFar
  if (Object.hasOwnProperty.call(properties, 'shadowBias')) light.shadow.bias = component.shadowBias
  if (Object.hasOwnProperty.call(properties, 'shadowRadius')) light.shadow.radius = component.shadowRadius
  if (Object.hasOwnProperty.call(properties, 'castShadow')) light.castShadow = component.castShadow

  if (Object.hasOwnProperty.call(properties, 'shadowMapResolution')) {
    light.shadow.mapSize.copy(component.shadowMapResolution)
    light.shadow.map?.dispose()
    light.shadow.map = null as any

    light.shadow.camera.updateProjectionMatrix()
    light.shadow.needsUpdate = true
  }

  if (Engine.isEditor) {
    light.userData.helper.update()
    light.userData.cameraHelper.visible = component.showCameraHelper

    if (component.showCameraHelper) {
      Engine.scene.add(light.userData.cameraHelper)
    } else {
      Engine.scene.remove(light.userData.cameraHelper)
    }

    light.userData.cameraHelper.update()
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
      showCameraHelper: component.showCameraHelper
    }
  }
}

export const prepareDirectionalLightForGLTFExport: ComponentPrepareForGLTFExportFunction = (light) => {
  if (light.userData.helper) {
    if (light.userData.helper.parent) light.userData.helper.removeFromParent()
    delete light.userData.helper
  }

  if (light.userData.cameraHelper) {
    if (light.userData.cameraHelper.parent) light.userData.cameraHelper.removeFromParent()
    delete light.userData.cameraHelper
  }
}

const parseDirectionalLightProperties = (props): DirectionalLightComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.color),
    intensity: props.intensity ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.intensity,
    castShadow: props.castShadow ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.castShadow,
    shadowBias: props.shadowBias ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.shadowBias,
    shadowRadius: props.shadowRadius ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.shadowRadius,
    shadowMapResolution: new Vector2().fromArray(
      props.shadowMapResolution ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.shadowMapResolution
    ),
    cameraFar: props.cameraFar ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.cameraFar,
    showCameraHelper: props.showCameraHelper ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.showCameraHelper
  } as DirectionalLightComponentType
}
