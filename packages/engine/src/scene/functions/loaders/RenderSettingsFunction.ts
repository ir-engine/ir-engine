import { DirectionalLight, Light, LinearToneMapping, Mesh, PCFSoftShadowMap, PerspectiveCamera, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { DEFAULT_LOD_DISTANCES } from '../../../assets/constants/LoaderConstants'
import { CSM } from '../../../assets/csm/CSM'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '../../../scene/components/DirectionalLightComponent'
import { Object3DComponent } from '../../../scene/components/Object3DComponent'
import { VisibleComponent } from '../../../scene/components/VisibleComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { RenderSettingComponent, RenderSettingComponentType } from '../../components/RenderSettingComponent'

export const SCENE_COMPONENT_RENDERER_SETTINGS = 'renderer-settings'
export const SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES = {
  LODs: { x: 5, y: 15, z: 30 },
  overrideRendererSettings: false,
  csm: true,
  toneMapping: LinearToneMapping,
  toneMappingExposure: 0.2,
  shadowMapType: PCFSoftShadowMap
}

export const deserializeRenderSetting: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<RenderSettingComponentType>
) => {
  const props = parseRenderSettingsProperties(json.props)
  addComponent(entity, RenderSettingComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_RENDERER_SETTINGS)

  updateRenderSetting(entity, props)
}

export const updateRenderSetting: ComponentUpdateFunction = (
  entity: Entity,
  properties: RenderSettingComponentType
) => {
  if (!isClient) return

  const component = getComponent(entity, RenderSettingComponent)

  if (typeof properties.LODs !== 'undefined' && component.LODs)
    Engine.instance.currentWorld.LOD_DISTANCES = { '0': component.LODs.x, '1': component.LODs.y, '2': component.LODs.z }

  if (typeof properties.overrideRendererSettings !== 'undefined') {
    if (properties.overrideRendererSettings) {
      EngineRenderer.instance.renderer.toneMapping = component.toneMapping
      EngineRenderer.instance.renderer.toneMappingExposure = component.toneMappingExposure

      updateShadowMap(component.shadowMapType > -1, component.shadowMapType)

      if (component.csm) enableCSM()
      else disposeCSM()
    } else {
      resetEngineRenderer(false, false)
      enableCSM()
    }

    return
  }

  if (component.overrideRendererSettings) {
    if (typeof properties.toneMapping !== 'undefined')
      EngineRenderer.instance.renderer.toneMapping = component.toneMapping
    if (typeof properties.toneMappingExposure !== 'undefined')
      EngineRenderer.instance.renderer.toneMappingExposure = component.toneMappingExposure

    if (typeof properties.shadowMapType !== 'undefined')
      updateShadowMap(component.shadowMapType > -1, component.shadowMapType)

    if (typeof properties.csm !== 'undefined') {
      if (component.csm) enableCSM()
      else disposeCSM()
    }
  }
}

export const updateShadowMapOnSceneLoad = (enable: boolean, shadowMapType?: number) => {
  if (getEngineState().sceneLoaded.value) updateShadowMap(enable, shadowMapType)
  else
    matchActionOnce(EngineActions.sceneLoaded.matches, () => {
      updateShadowMap(enable, shadowMapType)
    })
}

export const updateShadowMap = (enable: boolean, shadowMapType?: number) => {
  if (enable) {
    EngineRenderer.instance.renderer.shadowMap.enabled = true
    EngineRenderer.instance.renderer.shadowMap.needsUpdate = true
    if (typeof shadowMapType !== 'undefined') EngineRenderer.instance.renderer.shadowMap.type = shadowMapType
  } else {
    EngineRenderer.instance.renderer.shadowMap.enabled = false
  }

  Engine.instance.currentWorld.scene.traverse((node: Light) => {
    if (node.isLight && node.shadow) {
      node.shadow.map?.dispose()
      node.castShadow = enable
    }
  })
}

const enableCSM = () => {
  if (!EngineRenderer.instance.csm && EngineRenderer.instance.renderer.shadowMap.enabled) {
    if (getEngineState().sceneLoaded.value) initializeCSM()
    else matchActionOnce(EngineActions.sceneLoaded.matches, initializeCSM)
  }
}

export const initializeCSM = () => {
  if (!Engine.instance.isHMD) {
    let lights
    let activeCSMLight
    if (EngineRenderer.instance.activeCSMLightEntity) {
      activeCSMLight = getComponent(EngineRenderer.instance.activeCSMLightEntity, Object3DComponent)
        ?.value as DirectionalLight
      lights = [activeCSMLight]

      if (hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent))
        removeComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)
    }

    EngineRenderer.instance.directionalLightEntities.forEach((entity) => {
      const light = getComponent(entity, Object3DComponent)?.value
      if (light) light.castShadow = false
    })

    EngineRenderer.instance.csm = new CSM({
      camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
      parent: Engine.instance.currentWorld.scene,
      lights
    })

    if (activeCSMLight) {
      activeCSMLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    }

    Engine.instance.currentWorld.scene.traverse((obj: Mesh) => {
      if (typeof obj.material !== 'undefined' && obj.receiveShadow) EngineRenderer.instance.csm.setupMaterial(obj)
    })
  }

  EngineRenderer.instance.isCSMEnabled = true
}

export const disposeCSM = () => {
  if (!EngineRenderer.instance.csm) return

  EngineRenderer.instance.csm.remove()
  EngineRenderer.instance.csm.dispose()
  EngineRenderer.instance.csm = undefined!

  if (EngineRenderer.instance.activeCSMLightEntity) {
    if (!hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)) {
      addComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent, {})
    }
  }

  EngineRenderer.instance.directionalLightEntities.forEach((entity) => {
    const light = getComponent(entity, Object3DComponent)?.value
    if (light) light.castShadow = getComponent(entity, DirectionalLightComponent).castShadow
  })

  EngineRenderer.instance.isCSMEnabled = false
}

export const resetEngineRenderer = (resetLODs = false, resetCSM = true) => {
  if (!isClient) return

  updateShadowMap(true, PCFSoftShadowMap)

  EngineRenderer.instance.renderer.toneMapping = LinearToneMapping
  EngineRenderer.instance.renderer.toneMappingExposure = 0.8

  if (resetLODs) Engine.instance.currentWorld.LOD_DISTANCES = Object.assign({}, DEFAULT_LOD_DISTANCES)

  if (resetCSM) disposeCSM()
}

export const serializeRenderSettings: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, RenderSettingComponent) as RenderSettingComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_RENDERER_SETTINGS,
    props: {
      LODs: component.LODs,
      overrideRendererSettings: component.overrideRendererSettings,
      csm: component.csm,
      toneMapping: component.toneMapping,
      toneMappingExposure: component.toneMappingExposure,
      shadowMapType: component.shadowMapType
    }
  }
}

const parseRenderSettingsProperties = (props): RenderSettingComponentType => {
  const result = {
    overrideRendererSettings:
      props.overrideRendererSettings ?? SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES.overrideRendererSettings,
    csm: props.csm ?? SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES.csm,
    toneMapping: props.toneMapping ?? SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES.toneMapping,
    toneMappingExposure:
      props.toneMappingExposure ?? SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES.toneMappingExposure,
    shadowMapType: props.shadowMapType ?? SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES.shadowMapType
  } as RenderSettingComponentType

  const tempV3 = props.LODs ?? SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES.LODs
  result.LODs = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  return result
}
