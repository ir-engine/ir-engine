import { CameraHelper, Color, DirectionalLight, Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { VisibleComponent } from '../../../scene/components/VisibleComponent'
import EditorDirectionalLightHelper from '../../classes/EditorDirectionalLightHelper'
import { DirectionalLightComponent, DirectionalLightComponentType } from '../../components/DirectionalLightComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { setObjectLayers } from '../setObjectLayers'

export const SCENE_COMPONENT_DIRECTIONAL_LIGHT = 'directional-light'
export const SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES = {
  color: '#ffffff',
  intensity: 1,
  castShadow: true,
  shadowMapResolution: [256, 256],
  shadowBias: 0,
  shadowRadius: 1,
  cameraFar: 100,
  showCameraHelper: false,
  useInCSM: false
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

  const helper = new EditorDirectionalLightHelper()
  helper.visible = true
  helper.userData.isHelper = true
  light.add(helper)
  light.userData.helper = helper

  const cameraHelper = new CameraHelper(light.shadow.camera)
  cameraHelper.visible = false
  light.userData.cameraHelper = cameraHelper
  cameraHelper.userData.isHelper = true

  setObjectLayers(helper, ObjectLayers.NodeHelper)
  setObjectLayers(cameraHelper, ObjectLayers.NodeHelper)

  EngineRenderer.instance.directionalLightEntities.push(entity)
  addComponent(entity, Object3DComponent, { value: light })
  addComponent(entity, DirectionalLightComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_DIRECTIONAL_LIGHT)

  updateDirectionalLight(entity, props)
}

export const updateDirectionalLight: ComponentUpdateFunction = (
  entity: Entity,
  properties: DirectionalLightComponentType
) => {
  const component = getComponent(entity, DirectionalLightComponent)
  const light = component.light

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
          addComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent, {})
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
        addComponent(entity, VisibleComponent, {})
      }
    }
  }

  light.userData.helper.update()
  light.userData.cameraHelper.visible = component.showCameraHelper

  if (component.showCameraHelper) {
    Engine.instance.scene.add(light.userData.cameraHelper)
  } else {
    Engine.instance.scene.remove(light.userData.cameraHelper)
  }

  light.userData.cameraHelper.update()
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
      showCameraHelper: component.showCameraHelper,
      useInCSM: component.useInCSM
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
    showCameraHelper: props.showCameraHelper ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.showCameraHelper,
    useInCSM: props.useInCSM ?? SCENE_COMPONENT_DIRECTIONAL_LIGHT_DEFAULT_VALUES.useInCSM
  } as DirectionalLightComponentType
}
