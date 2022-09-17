import { DirectionalLight, Light, LinearToneMapping, Mesh, PCFSoftShadowMap, PerspectiveCamera, Vector3 } from 'three'

import { DEFAULT_LOD_DISTANCES } from '../../../assets/constants/LoaderConstants'
import { CSM } from '../../../assets/csm/CSM'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { deepEqual } from '../../../common/functions/deepEqual'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '../../../scene/components/DirectionalLightComponent'
import { Object3DComponent } from '../../../scene/components/Object3DComponent'
import { VisibleComponent } from '../../../scene/components/VisibleComponent'
import {
  RenderSettingComponent,
  RenderSettingComponentType,
  SCENE_COMPONENT_RENDERER_SETTINGS_DEFAULT_VALUES
} from '../../components/RenderSettingComponent'

export const deserializeRenderSetting: ComponentDeserializeFunction = (
  entity: Entity,
  data: RenderSettingComponentType
) => {
  const props = parseRenderSettingsProperties(data)
  setComponent(entity, RenderSettingComponent, props)
}

export const updateRenderSetting: ComponentUpdateFunction = (entity: Entity) => {
  if (!isClient) return

  const component = getComponent(entity, RenderSettingComponent)

  const lods = { '0': component.LODs.x, '1': component.LODs.y, '2': component.LODs.z }

  if (!deepEqual(lods, Engine.instance.currentWorld.LOD_DISTANCES)) Engine.instance.currentWorld.LOD_DISTANCES = lods

  if (component.overrideRendererSettings) {
    EngineRenderer.instance.renderer.toneMapping = component.toneMapping
    EngineRenderer.instance.renderer.toneMappingExposure = component.toneMappingExposure

    updateShadowMap(component.shadowMapType > -1, component.shadowMapType)

    // TODO: may need to update to the CSM maintained in threejs
    if (component.csm) enableCSM()
    else disposeCSM()
  } else {
    resetEngineRenderer(false, false)
    enableCSM()
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
    let activeCSMLight: DirectionalLight | undefined
    if (EngineRenderer.instance.activeCSMLightEntity) {
      activeCSMLight = getComponent(EngineRenderer.instance.activeCSMLightEntity, DirectionalLightComponent).light

      if (hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent))
        removeComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)
    }

    for (const entity of EngineRenderer.instance.directionalLightEntities) {
      const light = getComponent(entity, DirectionalLightComponent)?.light
      if (light) light.castShadow = false
    }

    EngineRenderer.instance.csm = new CSM({
      camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
      parent: Engine.instance.currentWorld.scene,
      light: activeCSMLight
    })

    if (activeCSMLight) {
      activeCSMLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    }

    Engine.instance.currentWorld.scene.traverse((obj: Mesh) => {
      if (typeof obj.material !== 'undefined' && obj.receiveShadow) EngineRenderer.instance.csm.setupMaterial(obj)
    })
    EngineRenderer.instance.isCSMEnabled = true
  }
}

export const disposeCSM = () => {
  if (!EngineRenderer.instance.csm) return

  EngineRenderer.instance.csm.remove()
  EngineRenderer.instance.csm.dispose()
  EngineRenderer.instance.csm = undefined!

  if (EngineRenderer.instance.activeCSMLightEntity) {
    if (!hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)) {
      addComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent, true)
    }
  }

  for (const entity of EngineRenderer.instance.directionalLightEntities) {
    const light = getComponent(entity, DirectionalLightComponent)?.light
    if (light) light.castShadow = getComponent(entity, DirectionalLightComponent).castShadow
  }

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
  const component = getComponent(entity, RenderSettingComponent)
  return {
    LODs: component.LODs,
    overrideRendererSettings: component.overrideRendererSettings,
    csm: component.csm,
    toneMapping: component.toneMapping,
    toneMappingExposure: component.toneMappingExposure,
    shadowMapType: component.shadowMapType
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
